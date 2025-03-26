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
          const email = formData.get("email") || "";
          const subject = formData.get("subject");
          const message = formData.get("message");
          const location = formData.get("location") || "";
          const isNewsletter = subject === "Newsletter Subscription";

          // Get interests for newsletter
          let interests = [];
          if (isNewsletter) {
               interests = formData.getAll("interests") || [];
          }

          console.log("Form data received:", {
               name,
               email,
               subject,
               isNewsletter,
          });

          // Validate form data
          if (!name || !email) {
               return new Response(
                    JSON.stringify({
                         error: "Name and email are required",
                    }),
                    {
                         status: 400,
                         headers: {
                              "Content-Type": "application/json",
                              "Access-Control-Allow-Origin": "*",
                         },
                    }
               );
          }

          if (!isNewsletter && (!subject || !message)) {
               return new Response(
                    JSON.stringify({
                         error: "Subject and message are required for contact forms",
                    }),
                    {
                         status: 400,
                         headers: {
                              "Content-Type": "application/json",
                              "Access-Control-Allow-Origin": "*",
                         },
                    }
               );
          }

          // Format subject based on mapping
          const subjectMapping = {
               "add-network": "Add a Mutual Aid Network",
               "update-info": "Update Existing Information",
               suggestion: "Suggestion",
               question: "General Question",
               other: "Other",
          };

          const formattedSubject = isNewsletter
               ? "Newsletter Subscription"
               : `Contact Form: ${subjectMapping[subject] || subject}`;

          // Create Web3Forms payload
          let web3FormsData = {
               access_key: "66d4bcac-1c6a-4c7c-b544-c5b2a4c51f4f",
               subject: formattedSubject,
               from_name: isNewsletter
                    ? "Organize Directory Newsletter"
                    : "Organize Directory Contact Form",
               name: name,
               email: email,
               replyto: email,
          };

          // Format message based on form type
          if (isNewsletter) {
               web3FormsData.message = `
Newsletter Subscription:

Name: ${name}
Email: ${email}
Location: ${location || "Not provided"}
Interests: ${interests.join(", ") || "None selected"}
               `;
          } else {
               web3FormsData.message = `
Name: ${name}
Email: ${email ? email : "Anonymous submission"}
Subject: ${subjectMapping[subject] || subject}

Message:
${message}
               `;

               // Handle anonymous submissions for contact form
               if (!email) {
                    web3FormsData.email = "anonymous@example.com";
                    delete web3FormsData.replyto;
               }
          }

          console.log("Preparing to send data to Web3Forms");

          // Submit to Web3Forms API
          const response = await fetch("https://api.web3forms.com/submit", {
               method: "POST",
               headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
               },
               body: JSON.stringify(web3FormsData),
          });

          console.log("Web3Forms response status:", response.status);

          const responseData = await response.json();
          console.log("Web3Forms response data:", responseData);

          if (response.status === 200 && responseData.success) {
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
               console.error("Failed to send email:", responseData);
               return new Response(
                    JSON.stringify({
                         error: "Failed to send email",
                         details: responseData,
                    }),
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
          console.error("Error in form submission:", err.message, err.stack);
          return new Response(
               JSON.stringify({
                    error: "Internal server error",
                    message: err.message,
                    stack: err.stack,
               }),
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
}
