// Don't use import statement for Cloudflare plugins
// They are available at runtime in the Cloudflare environment

export const onRequest = async ({ request, env }) => {
     // We'll handle only POST requests for forms
     if (request.method !== "POST") {
          return new Response("Method not allowed", { status: 405 });
     }

     try {
          // Parse the form data
          const formData = await request.formData();

          // Get the form name from the data-static-form-name attribute
          const formName = formData.get("form-name") || "contact";

          // Extract key form fields
          const name = formData.get("name") || "Anonymous";
          const email = formData.get("email") || "anonymous@example.com";
          const subject = formData.get("subject") || "No subject";
          const message = formData.get("message") || "No message";

          // Log the submission (appears in Cloudflare Pages logs)
          console.log(`Form submission received: ${formName}`);
          console.log(`From: ${name} (${email})`);
          console.log(`Subject: ${subject}`);

          // Here you could add code to:
          // 1. Save the submission to KV
          // 2. Send an email notification
          // 3. Store in a database

          // Redirect back to the contact page with success parameter
          return Response.redirect(
               `/contact?form-name=${formName}&success=true`,
               302
          );
     } catch (error) {
          console.error("Error processing form:", error);
          return Response.redirect(
               "/contact?form-name=contact&success=false",
               302
          );
     }
};
