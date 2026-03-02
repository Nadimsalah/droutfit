async function testDemoApi() {
    const payload = {
        userImageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGBgXFxgYGBcXFxgXFxcXFhgbGBgYHSggGBolHRcXITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lICUtLS8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAADAgQFBgcBAAj/xAA9EAACAgEEAQIDBQUHBAMBAAABAgMRAAQSITEFBhMiQTJRQmFxgZGhscHRI1KSsuHw8RQzYnLCB0NTgsP/xAAZAQADAQEBAAAAAAAAAAAAAAABAgMEAAX/xAAiEQACAgIDAQEBAQEBAAAAAAAAAQIRAxIhMUETIlEyBGH/2gAMA4EAAhEDEQA/ANmOOvHhSMeB8fTAFfLp8McD3S8H6+nAFeR45HjkeOR496+nAFeR45HjkePR4+nn0ePR4Mejz6P9p9Hn0efR/t9HPp8/t9Hn0eP9vo59Pj/AGejn0f7fR3j6efR/t9HnHn0P9nox4McfQv2ejjj/afRxx9P9nox4Met6MeMevpwx4Met7Met6Met6Met7Met6MePevo6fRjwY8C9e8ejHo96+nHj0Y8G9e8ejHo73X0ecfp6O8ej/p6P8AafRpx59H+30ccePRvt9HOPr6P9vp59Pj6efT/Z6OPR4/2ejn0eP9vo5x7Met7Met7MetetfWvX09PrXr6emvX09Nevp+vX0/WvX09NevfWvX0/WvX09NevfWvX09XvXvXvXvXvX0+v6e/p7+nv6e/p7Pr6fHjx/t9HOPHj/Z6OePR/tPo84+m/R/R4+m/Wv6MetetfXvWvreverevevr3rX1vXvXvXvXvXvXvXvX16/p9f09/T39Pf09/T39Pf09/T39Pf09/T39Pf09/T39Pf01e+u1e+u+u+u+u+u+uveuvevXr169evXvXvXvXrevereveur36+vereveur36/p7+vevereur69fXr19evXr//2Q==",
        garmentUrl: "/alaska-jacket.webp"
    };

    try {
        const resp = await fetch('http://localhost:3002/api/generate-demo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        console.log("API Response Status:", resp.status);
        console.log("API Response Data:", data);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testDemoApi();
