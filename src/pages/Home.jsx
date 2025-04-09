
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Section } from "@/api/entities";
import { 
  ArrowRight, 
  FileCode, 
  Wallet, 
  Code, 
  Settings, 
  RefreshCw, 
  Share2,
  SendHorizonal,
  ChevronDown
} from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="p-8 md:p-12 mb-12 bg-yellow-300 neo-brutalism relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            NEAR Intents & <br />
            Smart Wallet Abstraction
          </h1>
          <p className="text-xl md:text-2xl font-bold mb-8 max-w-3xl">
            A hands-on workshop for building next-generation dApps with NEAR's intent-centric architecture
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={createPageUrl("Section?slug=welcome")}>
              <Button className="bg-black text-white neo-button text-lg px-8 py-6 font-bold">
                Start Workshop <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <a 
              href="https://github.com/near/intents-workshop" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white neo-button text-lg px-8 py-6 font-bold flex items-center"
            >
              View on GitHub <FileCode className="ml-2" />
            </a>
          </div>
        </div>
        
        {/* Abstract graphic elements */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-orange-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-10 right-24 w-40 h-40 bg-blue-500 rounded-full opacity-30"></div>
      </div>

      {/* Workshop Overview */}
      <div className="mb-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Workshop Overview</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-cyan-200 neo-brutalism">
            <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>The fundamentals of Intent-Centric Architecture</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>Building Smart Wallet Abstractions for better UX</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>Creating Verifiers and Solvers for NEAR intents</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>Implementing cross-chain features with intent architecture</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>Production best practices and advanced techniques</span>
              </li>
            </ul>
          </div>
          <div className="p-6 bg-purple-200 neo-brutalism">
            <h3 className="text-xl font-bold mb-4">Prerequisites</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>Basic knowledge of blockchain concepts</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>Familiarity with JavaScript/TypeScript</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>Understanding of React framework basics</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>NEAR account on testnet (we'll help you set this up)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                <span>Node.js and npm/yarn installed locally</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Workshop Structure */}
      <div className="mb-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Workshop Structure</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-pink-200 neo-brutalism flex flex-col">
            <div className="mb-4 w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
            <h3 className="text-xl font-bold mb-2">Core Concepts</h3>
            <p className="flex-grow mb-4">Master the fundamentals of NEAR Intents, Smart Wallet Abstraction, and Intent-Centric Architecture. Understand how these components work together to create seamless blockchain experiences.</p>
            <Link to={createPageUrl("Section?slug=intents-concept")}>
              <Button className="w-full bg-white neo-button font-bold">
                Start Learning
              </Button>
            </Link>
          </div>
          <div className="p-6 bg-green-200 neo-brutalism flex flex-col">
            <div className="mb-4 w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
            <h3 className="text-xl font-bold mb-2">Technical Implementation</h3>
            <p className="flex-grow mb-4">Dive into practical implementation with hands-on examples. Build verifiers, solvers, and smart wallets while learning best practices for production-ready code.</p>
            <Link to={createPageUrl("Section?slug=local-contract")}>
              <Button className="w-full bg-white neo-button font-bold">
                Start Building
              </Button>
            </Link>
          </div>
          <div className="p-6 bg-orange-200 neo-brutalism flex flex-col">
            <div className="mb-4 w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
            <h3 className="text-xl font-bold mb-2">Advanced Integration</h3>
            <p className="flex-grow mb-4">Learn advanced patterns for cross-chain operations, composability with DeFi protocols, and integrating with the broader NEAR ecosystem including Aurora and BOS.</p>
            <Link to={createPageUrl("Section?slug=cross-chain")}>
              <Button className="w-full bg-white neo-button font-bold">
                Explore Advanced
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Key Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 bg-blue-200 neo-brutalism text-center">
            <Wallet className="mx-auto h-12 w-12 mb-4" />
            <h3 className="font-bold mb-2">Smart Wallet Abstraction</h3>
            <p className="text-sm">Abstract away complexity for seamless user experience</p>
          </div>
          <div className="p-6 bg-red-200 neo-brutalism text-center">
            <Code className="mx-auto h-12 w-12 mb-4" />
            <h3 className="font-bold mb-2">Intent Verification</h3>
            <p className="text-sm">Secure, flexible transaction validation</p>
          </div>
          <div className="p-6 bg-green-200 neo-brutalism text-center">
            <Settings className="mx-auto h-12 w-12 mb-4" />
            <h3 className="font-bold mb-2">Solver Mechanics</h3>
            <p className="text-sm">Efficient execution of user intents</p>
          </div>
          <div className="p-6 bg-purple-200 neo-brutalism text-center">
            <Share2 className="mx-auto h-12 w-12 mb-4" />
            <h3 className="font-bold mb-2">Cross-Chain Integration</h3>
            <p className="text-sm">Seamless multi-chain interactions</p>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="p-8 bg-blue-300 neo-brutalism mb-12">
        <h2 className="text-3xl font-black mb-4">Ready to Begin?</h2>
        <p className="text-xl mb-6">Start your journey with NEAR Intents and revolutionize your dApp development approach</p>
        <div className="flex flex-wrap gap-4">
          <Link to={createPageUrl("Section?slug=welcome")}>
            <Button className="bg-black text-white neo-button text-lg px-6 py-3 font-bold">
              Start the Workshop
            </Button>
          </Link>
          <Link to={createPageUrl("Section?slug=overview")}>
            <Button className="bg-white neo-button text-lg px-6 py-3 font-bold">
              Quick Overview
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-6 bg-gray-100 neo-brutalism">
            <h3 className="text-xl font-bold flex items-center justify-between cursor-pointer">
              <span>What makes Intents different from regular transactions?</span>
              <ChevronDown className="w-6 h-6" />
            </h3>
            <p className="mt-4">
              Intents represent what users want to achieve rather than how to achieve it. Unlike traditional transactions where users specify exact steps, intents allow the network to determine the optimal execution path, creating more flexibility and better user experiences.
            </p>
          </div>
          <div className="p-6 bg-gray-100 neo-brutalism">
            <h3 className="text-xl font-bold flex items-center justify-between cursor-pointer">
              <span>Do I need to know Rust for this workshop?</span>
              <ChevronDown className="w-6 h-6" />
            </h3>
            <p className="mt-4">
              While having some Rust knowledge is helpful for smart contract development, the workshop provides code samples and explanations that you can follow even without deep Rust experience. We focus more on the concepts and architecture than advanced language features.
            </p>
          </div>
          <div className="p-6 bg-gray-100 neo-brutalism">
            <h3 className="text-xl font-bold flex items-center justify-between cursor-pointer">
              <span>How does this apply to existing NEAR applications?</span>
              <ChevronDown className="w-6 h-6" />
            </h3>
            <p className="mt-4">
              Existing applications can gradually adopt the Intent architecture to improve user experience. The workshop includes sections on migration strategies and how to blend traditional and intent-based approaches in your application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
