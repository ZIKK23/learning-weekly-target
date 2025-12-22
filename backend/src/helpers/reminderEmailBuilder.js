exports.buildReminderEmail = ({
  username,
  isTargetDay,
  modules,
  unfinishedModules,
  nextStudyDate
}) => {
  return `
  <div style="font-family:Arial, sans-serif; background:#f5f7fa; padding:20px; color:#333;">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px;">

      <!-- Header -->
      <div style="text-align:center; margin-bottom:25px;">
        <h1 style="margin:0; font-size:24px; color:#ff9f43;">Learning Daily — Reminder</h1>
        <p style="margin-top:5px; color:#666;">
          Your daily learning reminder ✨
        </p>
      </div>

      <!-- Greeting -->
      <p style="font-size:16px;">Hi <strong>${username}</strong> 👋</p>

      ${
        isTargetDay
          ? `
            <!-- Target Day Message -->
            <p style="color:#555; margin-bottom:20px;">
              Today is your <strong>scheduled study day</strong>! Here are the modules you need to work on:
            </p>

            <h3 style="color:#ff9f43;">📚 Today's Modules</h3>
            ${modules
              .map(
                (m) => `
              <div style="padding:12px; margin-bottom:12px; border:1px solid #eee; border-radius:8px;">
                <p style="margin:0 0 4px 0; font-size:15px;"><strong>${m.name}</strong></p>
                <p style="margin:0;">Status: <strong>${m.status}</strong></p>
              </div>
            `
              )
              .join("")}

            <p style="margin-top:25px; font-size:15px; font-weight:600;">
              Stay motivated and give your best today! 💪🔥
            </p>
          `
          : `
            <!-- Non Target Day Message -->
            <p style="color:#555; margin-bottom:20px;">
              Today is <strong>not a scheduled study day</strong>. That's okay! You can still review your progress.
            </p>

            <h3 style="color:#ff9f43;">📚 Unfinished Modules</h3>
            ${
              unfinishedModules.length
                ? unfinishedModules
                    .map(
                      (m) => `
                <div style="padding:12px; margin-bottom:12px; border:1px solid #eee; border-radius:8px;">
                  <p style="margin:0 0 4px 0; font-size:15px;"><strong>${m.name}</strong></p>
                  <p style="margin:0;">Status: <strong>${m.status}</strong></p>
                </div>
              `
                    )
                    .join("")
                : `
                <p style="padding:12px; border:1px solid #eee; border-radius:8px;">
                  🎉 All modules are completed! Great job!
                </p>
              `
            }

            <h3 style="color:#ff9f43; margin-top:25px;">📅 Next Study Schedule</h3>
            <p style="font-size:15px;">
              ${
                nextStudyDate
                  ? `<strong>${nextStudyDate}</strong> — get ready for your next study day!`
                  : "There are no more study days scheduled for this week 🎉"
              }
            </p>

            <p style="margin-top:25px; font-size:15px; font-weight:600;">
              Keep your learning rhythm steady! 😊✨
            </p>
          `
      }

    </div>
  </div>
  `;
};
