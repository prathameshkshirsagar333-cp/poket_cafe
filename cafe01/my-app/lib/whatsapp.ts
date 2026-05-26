import axios from 'axios';

export const sendWhatsAppOrderConfirmation = async (
  phone: string,
  customerName: string,
  orderNumber: string,
  totalAmount: number,
  itemsList: string,
  estimatedDelivery: string = "20-30 minutes"
) => {
  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("WhatsApp credentials are not configured in environment variables.");
    return false;
  }

  // Format phone number to include country code without + or spaces
  // The user should provide something like 91XXXXXXXXXX
  let formattedPhone = phone.replace(/\D/g, "");
  
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    // Constructing a nice message using Meta Cloud API Text Format
    // Note: For production, using WhatsApp Templates is recommended to send to users outside the 24h window.
    // Here we use a generic text message for demonstration, assuming the user initiated or template is not strictly required for test.
    const messageText = `🍽️ Order Confirmed!
Thank you for ordering from Cafe Express ☕

Order Details:
- Order ID: #${orderNumber}
- Items:
${itemsList}
- Total: ₹${totalAmount.toFixed(2)}
- Status: Pending
- Delivery: ${estimatedDelivery}

We will notify you once it's out for delivery. Enjoy your meal! 🍔🍰`;

    const data = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: messageText,
      },
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`WhatsApp message sent successfully to ${formattedPhone}. Message ID: ${response.data.messages[0].id}`);
    return true;
  } catch (error: any) {
    console.error("Failed to send WhatsApp message:", error?.response?.data || error.message);
    return false;
  }
};
