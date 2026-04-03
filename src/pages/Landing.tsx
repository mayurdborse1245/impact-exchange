import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, Globe, BarChart3, Lock, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const { user } = useAuth();

  const features = [
    { icon: Globe, title: 'Disaster Prevention', desc: 'Invest in projects that protect communities from floods, droughts, fires, and more.' },
    { icon: TrendingUp, title: 'Earn Returns', desc: 'Get 10-20% returns while making a positive impact on disaster prevention.' },
    { icon: BarChart3, title: 'Live Monitoring', desc: 'Track project progress with real-time IoT and satellite data feeds.' },
    { icon: Lock, title: 'Escrow Protection', desc: 'Your funds are secured in escrow until project milestones are verified.' },
    { icon: Shield, title: 'AI Risk Assessment', desc: 'Every project is evaluated with AI-powered risk scoring and verification.' },
    { icon: Zap, title: 'FIU Trading', desc: 'Buy and manage Future Impact Units – fractional investments in prevention projects.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <Shield className="w-4 h-4" /> Future Impact Exchange
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
              Invest in <span className="text-gradient">Disaster Prevention</span>, Earn Real Returns
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              FIX connects investors with verified disaster prevention projects. Buy Future Impact Units, protect communities, and earn 10-20% returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Button asChild size="lg" className="text-base">
                  <Link to="/dashboard">Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-base">
                    <Link to="/signup">Start Investing <ArrowRight className="w-4 h-4 ml-2" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
          >
            {[
              { label: 'Projects Funded', value: '150+' },
              { label: 'Total Invested', value: '₹45Cr' },
              { label: 'Avg. ROI', value: '15.4%' },
              { label: 'Communities Protected', value: '2M+' },
            ].map(s => (
              <div key={s.label} className="text-center p-4 rounded-xl glass">
                <p className="font-display text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-3">How FIX Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">A transparent, AI-verified platform that connects capital with disaster prevention</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-card border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto rounded-2xl gradient-primary p-10 text-primary-foreground">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
            <p className="text-primary-foreground/80 mb-6">Join thousands of investors building a disaster-resilient future.</p>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">FIX</span>
            <span className="text-sm text-muted-foreground">Future Impact Exchange</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 FIX Platform. Simulated investment environment.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
