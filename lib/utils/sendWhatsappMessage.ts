async function sendWhatsappMessage({
  to = "+2348085716180",
  message = "Hello from Twilio.",
}: {
  to?: string;
  message?: string;
}) {
  // const response = await fetch("/api/send-whatsapp", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     to: to,
  //     message: message,
  //   }),
  // });
  // const data = await response.json();
  // console.log("Response:", data);
}
export default sendWhatsappMessage;
