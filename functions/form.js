import staticFormsPlugin from "@cloudflare/pages-plugin-static-forms";

export const onRequest = staticFormsPlugin({
     respondWith: ({ formData, name }) => {
          // Log the form data for debugging
          console.log("Form submitted:", name);
          console.log("Form data:", Object.fromEntries(formData.entries()));

          // Extract form fields
          const userName = formData.get("name") || "Anonymous";
          const email = formData.get("email") || "anonymous@example.com";
          const subject = formData.get("subject") || "No subject";
          const message = formData.get("message") || "No message";

          // Here you could:
          // 1. Save to a database
          // 2. Send an email notification
          // 3. Log to an analytics platform

          // Send a success response
          return Response.redirect(
               `/contact?form-name=contact&success=true`,
               302
          );
     },
});
