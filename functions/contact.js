// Contact form handler function

export async function onRequestPost({ request }) {
     try {
          // Parse the form data
          const formData = await request.formData();

          // Get the form data
          const name = formData.get("name") || "Anonymous";
          const email = formData.get("email") || "anonymous@example.com";
          const subject = formData.get("subject") || "No subject";
          const message = formData.get("message") || "No message";

          // Log the form submission
          console.log(`Form submission received from: ${name}`);
          console.log(`Email: ${email}`);
          console.log(`Subject: ${subject}`);
          console.log(`Message: ${message.substring(0, 50)}...`);

          // Here you can add code to send an email, save to a database, etc.

          // Redirect back to the contact page with success parameter
          return Response.redirect(
               "/contact?form-name=contact&success=true",
               302
          );
     } catch (error) {
          console.error("Error processing form:", error);
          return Response.redirect(
               "/contact?form-name=contact&success=false",
               302
          );
     }
}
