const url = "https://rqeysftpupsotssnsilh.supabase.co/rest/v1/doctor_shifts?select=*";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZXlzZnRwdXBzb3Rzc25zaWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzM1MDQsImV4cCI6MjA5NDM0OTUwNH0.d-lfU8RYs1L43Lo8vSKEZXVFTIHL7QizucFfYy0TtZI";

fetch(url, {
  headers: {
    "apikey": apikey,
    "Authorization": `Bearer ${apikey}`
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
