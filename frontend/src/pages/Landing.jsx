import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    GitBranch,
    BarChart3,
    MessageSquare,
    Users,
    Zap,
    Shield,
    ArrowRight,
    Github,
    Slack,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <GitBranch className="w-8 h-8" />,
            title: "GitHub Integration",
            description: "Seamlessly sync repositories and track code changes across your team in real-time."
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Performance Analytics",
            description: "Monitor team productivity with advanced metrics and actionable insights."
        },
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Slack Sync",
            description: "Get instant notifications and collaborate without leaving Slack."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Team Management",
            description: "Organize workflows with flexible role-based access and team structures."
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Real-time Updates",
            description: "Stay synchronized with live updates across all integrated tools."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Enterprise Security",
            description: "Bank-level security with SOC 2 compliance and encrypted data."
        }
    ];

    return (
        <div className="min-h-screen w-full bg-[#0B0C15] overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-nebula-purple/10 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-nebula-cyan/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: "1s" }} />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0B0C15]/50 backdrop-blur-xl h-20 transition-all duration-300">
                <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-8">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-cyan to-nebula-purple flex items-center justify-center shadow-lg shadow-nebula-cyan/20">
                            <span className="font-bold text-white text-lg">N</span>
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 hidden sm:block">
                            Nebula Flow
                        </h1>
                    </div>

                    {/* Center Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-white/70 hover:text-white transition-colors font-medium"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-white/70 hover:text-white transition-colors font-medium"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-white/70 hover:text-white transition-colors font-medium"
                        >
                            About
                        </button>
                        <button
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-white/70 hover:text-white transition-colors font-medium"
                        >
                            Contact
                        </button>
                    </div>

                    {/* Right Side - Auth Buttons */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/90 font-semibold px-6 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            onClick={() => navigate('/signup')}
                        >
                            Register
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative z-10 pt-40 pb-24 px-4 container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="space-y-4">
                            <div className="inline-block">
                                <span className="px-4 py-2 rounded-full bg-nebula-cyan/10 text-nebula-cyan text-sm font-semibold border border-nebula-cyan/30">
                                    ✨ Intelligent Workflow Automation
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Orchestrate Your{' '}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-nebula-cyan via-nebula-purple to-nebula-pink">
                                    Team's Workflow
                                </span>
                            </h1>
                            <p className="text-xl text-white/60 max-w-lg">
                                Connect GitHub, Jira, Slack, and more. Gain real-time insights into your team's productivity and streamline collaboration across dispersed teams.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-white/90 font-semibold px-8 h-14 rounded-full text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                                onClick={() => navigate('/signup')}
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white/20 text-white hover:bg-white/5 font-semibold px-8 h-14 rounded-full text-lg"
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Know More
                            </Button>
                        </div>

                        {/* Social Proof */}
                        <div className="pt-8 border-t border-white/10 flex items-center gap-8">
                            <div>
                                <p className="text-2xl font-bold text-white">500+</p>
                                <p className="text-sm text-white/60">Teams Using Nebula</p>
                            </div>
                            <div className="h-12 w-px bg-white/10" />
                            <div>
                                <p className="text-2xl font-bold text-white">99.9%</p>
                                <p className="text-sm text-white/60">Uptime SLA</p>
                            </div>
                            <div className="h-12 w-px bg-white/10" />
                            <div>
                                <p className="text-2xl font-bold text-white">24/7</p>
                                <p className="text-sm text-white/60">Support</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Hero Image / Visual */}
                    <div className="relative h-[500px] animate-fade-in-up delay-200">
                        <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl bg-white/5">
                            {/* Glassmorphic Hero Visual */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="space-y-8 w-full p-8">
                                    {/* Integrated Tools Preview */}
                                    <div className="flex justify-around items-center">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-nebula-cyan/30 to-nebula-cyan/10 flex items-center justify-center border border-nebula-cyan/30 hover:scale-110 transition-transform">
                                            <Github className="w-8 h-8 text-nebula-cyan" />
                                        </div>
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-nebula-pink/30 to-nebula-pink/10 flex items-center justify-center border border-nebula-pink/30 hover:scale-110 transition-transform">
                                            <Briefcase className="w-8 h-8 text-nebula-pink" />
                                        </div>
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-nebula-purple/30 to-nebula-purple/10 flex items-center justify-center border border-nebula-purple/30 hover:scale-110 transition-transform">
                                            <Slack className="w-8 h-8 text-nebula-purple" />
                                        </div>
                                    </div>

                                    {/* Dashboard Preview */}
                                    <div className="space-y-4">
                                        <div className="h-3 bg-gradient-to-r from-nebula-cyan/40 to-transparent rounded-full" />
                                        <div className="h-3 bg-gradient-to-r from-nebula-purple/40 to-transparent rounded-full w-3/4" />
                                        <div className="h-3 bg-gradient-to-r from-nebula-pink/40 to-transparent rounded-full w-1/2" />
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                            <p className="text-xs text-white/50">Productivity</p>
                                            <p className="text-lg font-bold text-nebula-cyan">+45%</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                            <p className="text-xs text-white/50">Time Saved</p>
                                            <p className="text-lg font-bold text-nebula-purple">8hrs/week</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Animated background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-nebula-cyan/10 via-transparent to-nebula-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-24 px-4 container mx-auto max-w-7xl">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        Powerful Features for{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-nebula-cyan to-nebula-purple">
                            Modern Teams
                        </span>
                    </h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Everything you need to manage, analyze, and optimize your team's workflow in one unified platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all duration-300 hover:border-nebula-cyan/30 animate-fade-in-up"
                        >
                            {/* Hover gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-nebula-cyan/5 to-nebula-purple/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                            <div className="relative space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-nebula-cyan to-nebula-purple flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                                <p className="text-white/60">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="relative z-10 py-24 px-4 container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative h-[400px] animate-fade-in-up">
                        <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl bg-gradient-to-br from-nebula-cyan/10 to-nebula-purple/10">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nebula-cyan to-nebula-purple">
                                        Nebula
                                    </div>
                                    <p className="text-white/60">Powering Distributed Teams</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-4xl font-bold text-white">
                            About <span className="text-nebula-cyan">Nebula Flow</span>
                        </h2>
                        <p className="text-white/70 text-lg">
                            Nebula Flow is a unified workflow automation platform designed for distributed teams. We believe that great work happens when your tools talk to each other seamlessly.
                        </p>
                        <p className="text-white/70 text-lg">
                            Our mission is to eliminate workflow silos by connecting GitHub, Jira, Slack, and other essential tools in one intelligent ecosystem. We help teams work smarter, not harder.
                        </p>
                        <div className="pt-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-nebula-cyan/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-nebula-cyan" />
                                </div>
                                <p className="text-white/70">Built by engineers, for engineers</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-nebula-cyan/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-nebula-cyan" />
                                </div>
                                <p className="text-white/70">Supporting 500+ active teams worldwide</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-nebula-cyan/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-nebula-cyan" />
                                </div>
                                <p className="text-white/70">Enterprise-grade security & compliance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative z-10 py-24 px-4 container mx-auto max-w-4xl">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-xl overflow-hidden animate-fade-in-up">
                    <div className="p-12 lg:p-16 text-center space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white">
                            Ready to Transform Your{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-nebula-cyan to-nebula-purple">
                                Workflow?
                            </span>
                        </h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            Join hundreds of teams already using Nebula Flow to streamline their collaboration and boost productivity.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-white/90 font-semibold px-8 h-14 rounded-full text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                                onClick={() => navigate('/signup')}
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white/20 text-white hover:bg-white/5 font-semibold px-8 h-14 rounded-full text-lg"
                                onClick={() => window.open('mailto:contact@nebulaflow.com')}
                            >
                                Contact Sales
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-8">
                            <a href="mailto:contact@nebulaflow.com" className="text-white/70 hover:text-white transition-colors">
                                contact@nebulaflow.com
                            </a>
                            <div className="h-6 w-px bg-white/10 hidden sm:block" />
                            <a href="tel:+1234567890" className="text-white/70 hover:text-white transition-colors">
                                +1 (234) 567-890
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-[#0B0C15]/80 backdrop-blur-xl mt-24">
                <div className="container mx-auto max-w-7xl px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-cyan to-nebula-purple flex items-center justify-center">
                                    <span className="font-bold text-white">N</span>
                                </div>
                                <span className="font-bold text-white">Nebula Flow</span>
                            </div>
                            <p className="text-sm text-white/60">
                                Intelligent workflow automation for dispersed teams.
                            </p>
                        </div>

                        {/* Product */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="text-white/60 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Integrations</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">API Docs</a></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#about" className="text-white/60 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Press</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Security</a></li>
                                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-white/60">
                        <p>&copy; 2026 Nebula Flow. All rights reserved.</p>
                        <div className="flex items-center gap-6 mt-4 sm:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
