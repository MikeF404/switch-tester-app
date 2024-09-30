import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept a variety of payment methods including credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. For specific regions, we may also offer local payment options.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Shipping times vary depending on your location and the shipping method chosen. Typically, domestic orders are delivered within 3-5 business days, while international orders may take 7-14 business days. Expedited shipping options are available at checkout.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for most items. Products must be in their original condition and packaging. Please note that certain items, such as personalized products or perishables, may not be eligible for return. Shipping costs for returns are the responsibility of the customer unless the return is due to our error.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary depending on the destination. Please note that customers are responsible for any customs fees or import taxes that may apply.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order has been shipped, you will receive a confirmation email with a tracking number. You can use this number on our website or the carrier's website to track your package's progress.",
    },
    {
      question: "Are your products eco-friendly?",
      answer:
        "We are committed to sustainability and offer a range of eco-friendly products. Look for our 'Eco-Friendly' label on product pages. We're constantly working to expand our sustainable offerings and reduce our environmental impact across all our operations.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h1>
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
