import Footer from "../Layouts/Footer";
import Header from "../Layouts/Header";
import Hero from "../Layouts/Hero";
import Testimonials from "../Components/Testimonials";
import Newsletter from "../UI/Newsletter";
import Faq from "../Layouts/Faq";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const targetId = location.hash.replace("#", "");
    const element = document.getElementById(targetId);
    if (!element) return;

    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

  return (
    <div className="bg-[#f6f4ef]">
      <Header />
      <Hero />

      {/* about section */}
      <section id="about" className="flex w-full justify-around my-20 scroll-mt-28 md:flex-row flex-col">
        <div className="">
          <img
            src="https://images.unsplash.com/photo-1726062899787-a3e688951804?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="about"
            className="md:w-90 w-full object-cover h-90"
          />
        </div>
        <div className="md:w-2/6 w-full flex flex-col md:gap-12 gap-6">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: '"Orbitron"' }}
          >
            Our Story
          </h1>
          <p className="text-md font-semibold text-gray-600">
            Born from a belief that everyday objects deserve extraordinary
            attention, PropsAndShops curates pieces that transcend trends. Each item in
            our collection is selected for its craftsmanship, materiality, and
            the quiet joy it brings to daily rituals.
          </p>
          <p className="text-md font-semibold text-gray-600">
            We partner with artisans and small studios who share our commitment
            to responsible making — honouring heritage techniques while
            embracing thoughtful innovation.
          </p>
        </div>
      </section>

      {/* testimonials */}
      <section id="testimonials" className="w-full my-20 scroll-mt-28">
        <h1 className="text-3xl font-bold" style={{ fontFamily: '"Orbitron"' }}>
          Testimonials
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 w-[95%] mx-auto">
          <Testimonials
            det="Every piece from PropsAndShops feels like it was made just for me. The attention to detail is extraordinary."
            name="Sarah Johnson"
            role="Art Director, Paris"
          />
          <Testimonials
            det="I've simplified my entire wardrobe around their essentials. Quality you can feel the moment you touch it."
            name="Michael Chen"
            role="Product Designer, Tokyo"
          />
          <Testimonials
            det="The craftsmanship here is unmatched. Every item feels like it was made with care and intention."
            name="Emma Rodriguez"
            role="Interior Designer, Madrid"
          />
          <Testimonials
            det="PropsAndShops understands that true luxury is restraint. Their curation is unparalleled."
            name="David Kumar"
            role="Creative Director, Mumbai"
          />
          <Testimonials
            det="The attention to detail is extraordinary. Every piece feels like it was made with care and intention."
            name="Opeyemi Abudu"
            role="Fashion Editor, Nigeria"
          />
          <Testimonials
            det="The quality and design are exceptional. PropsAndShops has redefined what luxury means to me."
            name="James Wilson"
            role="Creative Director, Nigeria"
          />
        </div>
      </section>

      {/* why choose us */}
      <div className="bg-[url('https://images.unsplash.com/photo-1691519966399-f78efe3adf5c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzF8fHByb3BzfGVufDB8fDB8fHww')] bg-cover bg-center h-[550px] bg-fixed bg-blend-color-dodge bg-black/30 py-6">
        <h1
          className="text-4xl font-bold text-white text-center md:mt-20 mt-0"
          style={{ fontFamily: '"Orbitron"' }}
        >
          Why Choose PropsAndShops?
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-[95%] mx-auto mt-20">
          <div className="flex flex-col gap-3 items-center">
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: '"Orbitron"' }}
            >
              Built To Last
            </h2>
            <p className="text-white text-center">
              Not just display pieces—our props are engineered for durability,
              handling, and long-term preservation, so your collection stays
              legendary for years.
            </p>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: '"Orbitron"' }}
            >
              Authentic Craftsmanship
            </h2>
            <p className="text-white text-center">
              Built using professional studio techniques and premium materials,
              our props capture true cinematic detail—crafted to look, feel, and
              endure like the real artifacts from your favorite films.
            </p>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: '"Orbitron"' }}
            >
              Passion For Fandom
            </h2>
            <p className="text-white text-center">
              Created by fans, for fans. Every piece is designed with care,
              accuracy, and respect for the stories that inspired them.
            </p>
          </div>
        </div>
      </div>

      {/* faq */}
      <section id="faqs" className="scroll-mt-28">
        <Faq/>
      </section>

      {/* mewsletter */}
      <section id="newsletter" className="scroll-mt-28">
        <Newsletter/>
      </section>
      <Footer />
    </div>
  );
}
