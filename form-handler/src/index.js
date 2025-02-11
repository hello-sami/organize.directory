export default {
    async fetch(request, env) {
      // Handle CORS
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
  
      // Only allow POST requests
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
  
      try {
        const data = await request.json();
        
        // Validate required fields
        if (!data.name || !data.email || !data.message) {
          return new Response("Missing required fields", { status: 400 });
        }
  
        // Create email content
        const emailContent = {
          from: env.FROM_EMAIL,
          to: env.TO_EMAIL,
          subject: `New Contact Form Submission - ${data.category}`,
          text: `
  Name: ${data.name}
  Email: ${data.email}
  Category: ${data.category}
  
  Message:
  ${data.message}
          `,
        };
  
        // Send email using Cloudflare Email Workers
        await fetch("https://api.mailchannels.net/tx/v1/send", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(emailContent),
        });
  
        return new Response("Message sent successfully", {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(error.message, { status: 500 });
      }
    },
  };