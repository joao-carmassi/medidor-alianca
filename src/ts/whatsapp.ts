const whatsappPhone = import.meta.env.PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, '') ?? '';

export function createWhatsappUrl(text: string): string {
  const encodedText = encodeURIComponent(text);

  if (!whatsappPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }

  return `https://wa.me/${whatsappPhone}?text=${encodedText}`;
}
