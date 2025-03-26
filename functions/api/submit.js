// Handle both POST and OPTIONS (for CORS preflight) requests
export async function onRequest(context) {
     // For OPTIONS requests, return proper CORS headers
     if (context.request.method === "OPTIONS") {
          return new Response(null, {
               status: 204,
               headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Max-Age": "86400",
               },
          });
     }

     // For POST requests, call the existing handler
     if (context.request.method === "POST") {
          return onRequestPost(context);
     }

     // For any other method, return method not allowed
     return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
     });
}

export async function onRequestPost(context) {
     try {
          // Parse form data
          const formData = await context.request.formData();
          const name = formData.get("name");
          const email = formData.get("email");
          const subject = formData.get("subject");
          const message = formData.get("message");

          // Validate form data
          if (!name || !email || !subject || !message) {
               return new Response(
                    JSON.stringify({ error: "All fields are required" }),
                    {
                         status: 400,
                         headers: { "Content-Type": "application/json" },
                    }
               );
          }

          // Format email content
          const subjectMapping = {
               "add-network": "Add a Mutual Aid Network",
               "update-info": "Update Existing Information",
               suggestion: "Suggestion",
               question: "General Question",
               other: "Other",
          };

          const subjectLine = `Contact Form: ${subjectMapping[subject] || subject}`;

          // Email content
          const emailContent = `
Name: ${name}
Email: ${email}
Subject: ${subjectMapping[subject] || subject}

Message:
${message}
    `;

          // Use the legitimate domain email since user controls organize.directory
          const senderEmail = "hello@organize.directory";
          const recipientEmail = "hello@organize.directory"; // Will forward to organizedirectory@proton.me

          // Send email via Mailchannels
          const send = await fetch("https://api.mailchannels.net/tx/v1/send", {
               method: "POST",
               headers: {
                    "content-type": "application/json",
               },
               body: JSON.stringify({
                    personalizations: [
                         {
                              to: [{ email: recipientEmail }],
                              reply_to: { email: email, name: name },
                         },
                    ],
                    from: {
                         email: senderEmail,
                         name: "Organize Directory Contact Form",
                    },
                    subject: subjectLine,
                    content: [
                         {
                              type: "text/plain",
                              value: emailContent,
                         },
                    ],
               }),
          });

          // Check if email was sent successfully
          if (send.status >= 200 && send.status < 300) {
               // Return success response
               return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: {
                         "Content-Type": "application/json",
                         Location: "/thank-you",
                         "Access-Control-Allow-Origin": "*",
                         "Access-Control-Allow-Methods": "POST, OPTIONS",
                         "Access-Control-Allow-Headers": "Content-Type",
                    },
               });
          } else {
               // Log the error for debugging
               console.error("Failed to send email:", await send.text());
               return new Response(
                    JSON.stringify({ error: "Failed to send email" }),
                    {
                         status: 500,
                         headers: {
                              "Content-Type": "application/json",
                              "Access-Control-Allow-Origin": "*",
                              "Access-Control-Allow-Methods": "POST, OPTIONS",
                              "Access-Control-Allow-Headers": "Content-Type",
                         },
                    }
               );
          }
     } catch (err) {
          // Handle any unexpected errors
          console.error("Error in form submission:", err);
          return new Response(
               JSON.stringify({ error: "Internal server error" }),
               {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
               }
          );
     }
}
