import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Cpu, Wifi, Shield } from "lucide-react";

interface WelcomeStepProps {
  onContinue: () => void;
}

const features = [
  {
    icon: Cpu,
    title: "AI runs locally",
    description: "The model downloads to your device. No cloud, no servers.",
  },
  {
    icon: Wifi,
    title: "Works offline",
    description: "After download, chat without internet. Forever.",
  },
  {
    icon: Shield,
    title: "100% private",
    description: "Your conversations never leave your browser. Period.",
  },
];

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
      <div className="mx-auto max-w-[500px] text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#ff6b35]/20 blur-3xl" />
            <img src="/lokul-logo.png" alt="Lokul" className="relative h-16 w-16" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1
            className="mb-4 text-4xl leading-tight text-white md:text-5xl"
            style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
          >
            Before we begin,
            <br />
            <span className="text-[#ff6b35]">a quick setup.</span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 text-lg text-white/60"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          Lokul runs AI directly in your browser. To make that happen, we need to download a model
          file to your device.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-10 space-y-4"
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#ff6b35]/10">
                <feature.icon className="h-5 w-5 text-[#ff6b35]" />
              </div>
              <div>
                <h3
                  className="mb-1 font-medium text-white"
                  style={{ fontFamily: '"DM Sans", sans-serif' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm text-white/50"
                  style={{ fontFamily: '"DM Sans", sans-serif' }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button variant="cta" size="lg" onClick={onContinue} className="group min-w-[200px]">
            Choose Your Model
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-xs text-white/30"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          Models range from 80MB to 8GB. You can switch models anytime.
        </motion.p>
      </div>
    </div>
  );
}
