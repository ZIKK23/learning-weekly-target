import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, Check, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import { getSubmoduleContent, markSubmoduleComplete } from '../api';
import CustomAlert from '../components/CustomAlert';
import './SubmoduleContent.css';

function SubmoduleContent() {
  const { moduleId, submoduleId } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedModules, setExpandedModules] = useState(new Set([parseInt(moduleId)]));
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedSubmodules, setCompletedSubmodules] = useState(new Set());
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'info' });
  
  const showAlert = (message, type = 'info') => {
    setAlertConfig({ isOpen: true, message, type });
  };
  
  const closeAlert = () => {
    setAlertConfig({ isOpen: false, message: '', type: 'info' });
  };

  useEffect(() => {
    fetchSubmoduleContent();
  }, [moduleId, submoduleId]);

  // Track scroll progress berdasarkan tinggi box konten materi doang (contentRef),
  // bukan seluruh halaman -- sidebar progress di bawahnya (layout stacked di layar sempit)
  // gak boleh ikut mempengaruhi, kalau konten udah kelihatan semua ya langsung 100%.
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) {
        setScrollProgress(100);
        return;
      }

      const scrolledPast = Math.min(Math.max(-rect.top, 0), scrollable);
      setScrollProgress((scrolledPast / scrollable) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [data]);

  const fetchSubmoduleContent = async () => {
    try {
      setLoading(true);
      const response = await getSubmoduleContent(moduleId, submoduleId);
      
      if (response.status === 'ok') {
        setData(response.data);
        // Auto-expand the current module
        setExpandedModules(new Set([parseInt(moduleId)]));
        
        // Track which submodules are completed
        if (response.data.progress?.modules_list) {
          const completed = new Set();
          response.data.progress.modules_list.forEach(mod => {
            if (mod.submodules) {
              mod.submodules.forEach(sub => {
                if (sub.completed) {
                  completed.add(sub.id);
                }
              });
            }
          });
          setCompletedSubmodules(completed);
        }
      }
    } catch (error) {
      console.error('Error fetching submodule content:', error);
      showAlert('Failed to load submodule content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpand = (modId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(modId)) {
      newExpanded.delete(modId);
    } else {
      newExpanded.add(modId);
    }
    setExpandedModules(newExpanded);
  };

  const handleNavigate = async (direction) => {
    if (!data.navigation) return;
    
    // Mark current submodule as complete if scrolled >= 95% and clicking "Next"
    if (direction === 'next' && scrollProgress >= 95 && !completedSubmodules.has(parseInt(submoduleId))) {
      try {
        setIsCompleting(true);
        const response = await markSubmoduleComplete(moduleId, submoduleId);
        
        if (response.status === 'ok') {
          // Add to completed set
          setCompletedSubmodules(prev => new Set([...prev, parseInt(submoduleId)]));
          
          console.log('✅ Submodule completed!', response.progress);
          
          // If module fully completed, show notification
          if (response.moduleCompleted) {
            showAlert(`Congratulations! You've completed the entire module: ${data.module.name}\n\nStreak updated! 🔥`, 'success');
          }
        }
      } catch (error) {
        console.error('Error marking submodule complete:', error);
        showAlert(error.message || 'Gagal mencatat progress. Pastikan modul ini sudah dipilih di jadwal kamu.', 'error');
      } finally {
        setIsCompleting(false);
      }
    }
    
    // Navigate to next/previous
    if (direction === 'next') {
      if (data.navigation.has_next) {
        const next = data.navigation.next;
        navigate(`/module/${next.module_id}/submodule/${next.submodule_id}`);
      } else {
        // Finished last submodule
        // Completion logic specific to finishing the module can go here
        console.log('Finished last submodule!');
        // Optional: Redirect to dashboard after a short delay or user confirmation
        // For now, staying on page is fine as the "CONGRATS" alert handled in completion logic covers feedback
        // But let's add a redirect for better UX
        navigate('/dashboard'); 
      }
    } else if (direction === 'prev' && data.navigation.has_previous) {
      const prev = data.navigation.previous;
      navigate(`/module/${prev.module_id}/submodule/${prev.submodule_id}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="loading-container">
        Loading submodule content...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-container">
        Submodule not found
      </div>
    );
  }

  const { module, submodule, navigation, progress } = data;

  return (
    <div className="submodule-content-page">
      {/* Header */}
      <div className="submodule-header">
        <div className="submodule-header-left">
          <button className="back-button" onClick={handleBackToDashboard}>
            <ChevronLeft size={24} />
          </button>
          <span className="class-name">{module.class_name}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="submodule-container">
        {/* Main Content */}
        <div className="submodule-main" ref={contentRef}>
          <div className="breadcrumb">
            {module.name} / {submodule.title}
          </div>
          
          <h1 className="submodule-title">{submodule.title}</h1>
          
          <div className="submodule-content">
            <p>{submodule.content}</p>
          </div>

          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            <button 
              className="nav-button prev-button"
              onClick={() => handleNavigate('prev')}
              disabled={!navigation.has_previous}
            >
              <ArrowLeft size={20} />
              <span>Previous</span>
            </button>
            
            <button 
              className="nav-button next-button"
              onClick={() => handleNavigate('next')}
              disabled={(!navigation.has_next && completedSubmodules.has(parseInt(submoduleId))) || scrollProgress < 95 || isCompleting}
              title={scrollProgress < 95 ? 'Scroll to 95% to continue' : ''}
            >
              <span>
                {isCompleting ? 'Completing...' : !navigation.has_next ? 'Finish Module' : 'Next'}
              </span>
              {!navigation.has_next ? <Check size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>
        </div>

        {/* Progress Sidebar with Expandable Modules */}
        <div className="progress-sidebar">
          <div className="progress-header">
            <div className="progress-title">{module.class_name}</div>
            <div className="progress-stats">
              <span className="stats-text">
                {progress.progress_percent}% Complete
              </span>
            </div>
          </div>

          <div className="modules-progress-list">
            {progress.modules_list && progress.modules_list.map((item) => {
              const isExpanded = expandedModules.has(item.module_id);
              const isCurrentModule = item.module_id === parseInt(moduleId);
              const isCompleted = item.status === 'completed';

              return (
                <div key={item.module_id} className="module-group">
                  {/* Module Header (Collapsible) */}
                  <div 
                    className={`module-header-item ${isCurrentModule ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => toggleModuleExpand(item.module_id)}
                  >
                    <div className="module-expand-icon">
                      <ChevronRight 
                        size={16} 
                        style={{ 
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </div>
                    
                    <div className="module-indicator">
                      {isCompleted ? (
                        <div className="check-circle">
                          <Check size={14} />
                        </div>
                      ) : (
                        <div className="empty-circle"></div>
                      )}
                    </div>
                    
                    <span className="module-name">{item.name}</span>
                  </div>

                  {/* Submodules List (Expandable) */}
                  {isExpanded && item.submodules && item.submodules.length > 0 && (
                    <div className="submodules-list">
                      {item.submodules.map((sub) => {
                        const isActiveSub = item.module_id === parseInt(moduleId) && sub.id === parseInt(submoduleId);
                        const circleProgress = isActiveSub ? scrollProgress : 0;

                        return (
                           <div 
                            key={sub.id}
                            className={`submodule-item ${isActiveSub ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/module/${item.module_id}/submodule/${sub.id}`);
                            }}
                          >
                            <div className="submodule-indicator">
                              {completedSubmodules.has(sub.id) ? (
                                // Completed: Green checkmark
                                <div className="check-circle-small">
                                  <Check size={12} color="#22c55e" />
                                </div>
                              ) : isActiveSub ? (
                                // Active submodule: Progress ring
                                <div className="progress-ring-container">
                                  <svg className="progress-ring" width="20" height="20">
                                    <circle
                                      className="progress-ring-bg"
                                      cx="10"
                                      cy="10"
                                      r="8"
                                      strokeWidth="2"
                                    />
                                    <circle
                                      className="progress-ring-fill"
                                      cx="10"
                                      cy="10"
                                      r="8"
                                      strokeWidth="2"
                                      style={{
                                        strokeDasharray: `${2 * Math.PI * 8}`,
                                        strokeDashoffset: `${2 * Math.PI * 8 * (1 - circleProgress / 100)}`
                                      }}
                                    />
                                  </svg>
                                </div>
                              ) : (
                                <Circle size={8} className="submodule-dot" />
                              )}
                            </div>
                            <span className="submodule-name">{sub.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}

export default SubmoduleContent;
