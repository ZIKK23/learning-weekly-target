exports.buildFeedbackEmail = ({
  username,
  week_start,
  week_end,
  modules,
  totalMinutes,
  completedModules,
  totalModules,
  progressPercent
}) => {
  return `
  <div style="font-family:Arial, sans-serif; background:#f5f7fa; padding:20px; color:#333;">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px;">

      <!-- Brand Header -->
      <div style="text-align:center; margin-bottom:25px;">
        <h1 style="margin:0; font-size:24px; color:#2c7be5;">Learning Weekly — Summary</h1>
        <p style="margin-top:5px; color:#666;">
          Progress report for <strong>${week_start}</strong> — <strong>${week_end}</strong>
        </p>
      </div>

      <!-- Greeting -->
      <p style="font-size:16px;">Hi <strong>${username}</strong> 👋</p>
      <p style="color:#555; margin-bottom:25px;">
        Here’s your learning snapshot for the week. Keep going — small steps compound!
      </p>

      <!-- Stats -->
      <div style="margin:20px 0;">
        <table width="100%" role="presentation" style="border-spacing:0;">
          <tr>
            <td style="text-align:center; background:#fff; padding:15px; border:1px solid #eee;">
              <strong style="font-size:20px;">${totalModules}</strong><br>
              <small style="color:#777;">Modules</small>
            </td>
            <td style="text-align:center; background:#fff; padding:15px; border:1px solid #eee;">
              <strong style="font-size:20px;">${completedModules}</strong><br>
              <small style="color:#777;">Completed</small>
            </td>
            <td style="text-align:center; background:#fff; padding:15px; border:1px solid #eee;">
              <strong style="font-size:20px;">${totalMinutes} min</strong><br>
              <small style="color:#777;">Time Spent</small>
            </td>
          </tr>
        </table>
      </div>

      <!-- Progress Modules -->
      <h3 style="color:#2c7be5; margin-top:30px;">📚 Module Progress</h3>
      ${modules
        .map(
          (m) => `
        <div style="padding:12px; margin-bottom:12px; border:1px solid #eee; border-radius:8px;">
          <p style="margin:0 0 4px 0; font-size:15px;"><strong>${m.name}</strong></p>
          <p style="margin:0;">Status: <strong>${m.status}</strong></p>
          <p style="margin:0;">Estimated time: ${m.est_minutes} minutes</p>
        </div>
      `
        )
        .join("")}

      <!-- Recommendation -->
      <h3 style="color:#2c7be5; margin-top:30px;">🔥 Recommendation</h3>
      <p style="font-size:15px; font-weight:600;">
        ${
          progressPercent >= 80
            ? "Great job! Your consistency is impressive. Keep it up! 🎉"
            : progressPercent >= 40
            ? "Good effort! Try pushing a little more next week 💪"
            : "It’s okay — consider reducing your module load next week 😊"
        }
      </p>

    </div>
  </div>
  `;
};
