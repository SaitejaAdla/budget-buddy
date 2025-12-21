import { useState, useEffect } from "react";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import logo from "../assets/home.jpg";
import Footer from "./Footer";
import toast from "react-hot-toast";

const HomePage = () => {
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };
  const testimonials = [
    {
      name: "Emma L.",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
      feedback:
        "Expense Tracker transformed how I manage my money. Budgeting has never been easier!",
    },
    {
      name: "James K.",
      photo: "https://randomuser.me/api/portraits/men/46.jpg",
      feedback:
        "I love tracking my expenses and the reports helped me cut unnecessary spending.",
    },
    {
      name: "Sophia R.",
      photo: "https://randomuser.me/api/portraits/women/65.jpg",
      feedback:
        "The alerts keep me on track effortlessly. Highly recommend Expense Tracker!",
    },
    {
      name: "Michael B.",
      photo: "https://randomuser.me/api/portraits/men/52.jpg",
      feedback:
        "Manually entering my transactions is simple and gives me complete control over my finances.",
    },
    {
      name: "Olivia S.",
      photo: "https://randomuser.me/api/portraits/women/22.jpg",
      feedback:
        "Setting goals and tracking progress helped me save for my dream vacation faster than I thought!",
    },
    {
      name: "Daniel T.",
      photo: "https://randomuser.me/api/portraits/men/37.jpg",
      feedback:
        "The personalized spending insights make budgeting a breeze, even without bank integration.",
    },
  ];
  // Auto-advance testimonial every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const features = [
    {
      icon: "💰",
      title: "Track Expenses",
      description: "Log daily expenses easily to stay on budget.",
    },
    {
      icon: "📊",
      title: "Visual Reports",
      description: "View spending patterns with easy-to-read charts.",
    },
    {
      icon: "🎯",
      title: "Set Financial Goals",
      description: "Define savings targets and track your progress.",
    },
    {
      icon: "🔔",
      title: "Budget Alerts",
      description: "Receive notifications before you overspend.",
    },
  ];
  const howItWorks = [
    {
      step: 1,
      title: "Add Your Transactions Manually",
      description:
        "Easily input your income and expenses anytime to keep your finances up to date.",
    },
    {
      step: 2,
      title: "Categorize and Track Spending",
      description:
        "Assign categories to each transaction for a clear view of where your money goes.",
    },
    {
      step: 3,
      title: "Set Budgets & Financial Goals",
      description:
        "Create budgets and savings goals that help you manage your money effectively.",
    },
    {
      step: 4,
      title: "Visualize Your Finances",
      description:
        "Explore interactive charts and dashboards that show your income, expenses, and progress.",
    },
    {
      step: 5,
      title: "Receive Tips & Stay Motivated",
      description:
        "Get helpful financial tips and stay motivated to reach your goals faster.",
    },
  ];

  const faqs = [
    {
      question: "Is my financial data secure?",
      answer:
        "Yes, your data is stored securely and we prioritize your privacy. We never share your information with third parties.",
    },
    {
      question: "Can I track multiple budgets or goals?",
      answer:
        "Yes! You can create and manage multiple budgets and financial goals to suit your needs.",
    },
    {
      question: "Is there a mobile app?",
      answer:
        "Currently, we have a responsive web app that works well on mobile browsers. Mobile apps for iOS and Android are in development.",
    },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    if (email) {
      toast.success(`Thanks for subscribing with: ${email}`);
      e.target.reset();
    }
  };

  const handlePricingClick = (plan) => {
    toast(`You selected the ${plan} plan.`);
  };

  const toggleFaq = (index) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const handleFaqKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFaq(index);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#242C34] font-sans">
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative border border-[#E0E0E0]">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-2 right-3 text-[#7E909A] text-2xl hover:text-indigo-600 cursor-pointer transition-colors duration-300"
              aria-label="Close Login Modal"
            >
              &times;
            </button>
            <Login
              onClose={() => setShowLogin(false)}
              onSwitch={switchToRegister}
            />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative border border-[#E0E0E0]">
            <button
              onClick={() => setShowRegister(false)}
              className="absolute top-2 right-3 text-[#7E909A] text-2xl hover:text-indigo-600 cursor-pointer transition-colors duration-300"
              aria-label="Close Register Modal"
            >
              &times;
            </button>
            <Register
              onClose={() => setShowRegister(false)}
              onSwitch={switchToLogin}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px-8 md:px-8 py-20 gap-12 mb-20 bg-white rounded-lg shadow-lg">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-indigo-600 mb-6 leading-tight">
            Take Control of Your Finances with Expense Tracker
          </h1>
          <p className="text-lg md:text-xl text-[#7E909A] mb-8 max-w-md mx-auto md:mx-0">
            Effortlessly track expenses, set budgets, and reach your financial
            goals with real-time insights.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <button
              onClick={() => setShowRegister(true)}
              className="bg-indigo-600 hover:bg-[#66A3FF] text-white font-semibold rounded-md px-6 py-3 shadow-md hover:shadow-lg transition-colors duration-300 cursor-pointer"
            >
              Register
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="border border-indigo-600 text-indigo-600 hover:bg-[#66A3FF] hover:text-white rounded-md px-6 py-3 font-semibold transition-colors duration-300 cursor-pointer hover:shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
        <div className="md:w-1/2 max-w-md mx-auto">
          <img
            src={logo}
            alt="Finance Illustration"
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-indigo-600 py-20 px-6 sm:px-8 md:px-8 max-w-7xl mx-auto text-center rounded-lg shadow-lg mb-20">
        <h2 className="text-4xl font-bold text-white mb-12">
          Why Choose Expense Tracker?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="p-6 rounded-lg shadow-md hover:shadow-xl transition hover:border hover:border-[#66A3FF] bg-[#E6F0FF] cursor-pointer"
            >
              <div className="text-6xl mb-4 text-[#66A3FF]">{icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-600">
                {title}
              </h3>
              <p className="text-[#4A6572]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 px-6 sm:px-8 md:px-8 max-w-7xl mx-auto text-center rounded-lg shadow-lg mb-20">
        <h2 className="text-4xl font-bold text-indigo-600 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {howItWorks.map(({ step, title, description }) => (
            <div
              key={step}
              className="bg-[#d4e9fe] p-8 rounded-2xl shadow-md hover:shadow-xl transition hover:border hover:border-[#66A3FF] text-left cursor-pointer"
            >
              <div className="text-indigo-600 text-4xl font-extrabold mb-4">
                {step}
              </div>
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">
                {title}
              </h3>
              <p className="text-[#4A6572] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className="max-w-4xl mx-auto px-6 sm:px-8 py-20 text-center rounded-lg shadow-lg bg-white mb-20"
        aria-live="polite"
      >
        <h2 className="text-4xl font-bold text-indigo-600 mb-12">
          What Our Users Say
        </h2>
        <div className="relative max-w-xl mx-auto">
          <img
            src={testimonials[currentTestimonial].photo}
            alt={`Photo of ${testimonials[currentTestimonial].name}`}
            className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-2 border-[#66A3FF]"
          />
          <p className="text-lg sm:text-xl italic text-[#4A6572] max-w-2xl mx-auto mb-4 px-4 sm:px-0">
            "{testimonials[currentTestimonial].feedback}"
          </p>
          <p className="text-md sm:text-lg font-semibold text-indigo-600">
            — {testimonials[currentTestimonial].name}
          </p>
        </div>

        {/* Slider Dots */}
        <div className="flex justify-center mt-8 space-x-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                currentTestimonial === index
                  ? "bg-indigo-600"
                  : "bg-gray-300 hover:bg-gray-400"
              } transition`}
              aria-label={`Show testimonial ${index + 1}`}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20 bg-[#E6F0FF] rounded-lg shadow-lg mb-20">
        <h2 className="text-4xl font-bold text-indigo-600 mb-12 text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map(({ question, answer }, index) => (
            <div
              key={index}
              className="border border-[#66A3FF] rounded-lg shadow-md bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                onKeyDown={(e) => handleFaqKeyDown(e, index)}
                aria-expanded={faqOpenIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#66A3FF] transition-colors duration-200 hover:bg-[#EBF4FF]"
              >
                <span className="text-lg font-semibold text-indigo-600">
                  {question}
                </span>
                <span
                  className={`transform transition-transform duration-300 text-[#66A3FF] text-2xl select-none ${
                    faqOpenIndex === index ? "rotate-45" : "rotate-0"
                  }`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {faqOpenIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className="px-6 pb-6 text-[#4A6572] text-base sm:text-lg"
                >
                  {answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
