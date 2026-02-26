import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Folder,
    GitBranch,
    Star,
    Clock,
    LogOut,
    User,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Github
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const MOCK_REPOS = [
    {
        id: 1,
        name: "nebula-flow",
        description: "Intelligent workflow automation for dispersed teams.",
        language: "JavaScript",
        isPrivate: true,
        updatedAt: "2 mins ago",
        stars: 12,
        forks: 4
    },
    {
        id: 2,
        name: "cosmic-ui",
        description: "A React component library with glassmorphism styles.",
        language: "TypeScript",
        isPrivate: false,
        updatedAt: "4 hours ago",
        stars: 45,
        forks: 12
    },
    {
        id: 3,
        name: "star-dust-api",
        description: "Backend services for the Star Dust platform.",
        language: "Python",
        isPrivate: true,
        updatedAt: "1 day ago",
        stars: 8,
        forks: 1
    },
    {
        id: 4,
        name: "galaxy-brain",
        description: "AI model integration for predictive analysis.",
        language: "Python",
        isPrivate: true,
        updatedAt: "2 days ago",
        stars: 24,
        forks: 5
    },
    {
        id: 5,
        name: "asteroid-miner",
        description: "Data mining tools for deep space analytics.",
        language: "Rust",
        isPrivate: false,
        updatedAt: "5 days ago",
        stars: 89,
        forks: 14
    },
    {
        id: 6,
        name: "lunar-lander",
        description: "Physics engine demo for lunar landing simulation.",
        language: "C++",
        isPrivate: false,
        updatedAt: "1 week ago",
        stars: 156,
        forks: 32
    }
];

const RepositorySelection = () => {
    const navigate = useNavigate();
    const { user, role, logout } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [syncing, setSyncing] = useState({});
    const [repos, setRepos] = useState([]);

    const handleConnectObj = () => {
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnected(true);
            setIsConnecting(false);
            fetchRepos();
        }, 1500);
    };

    const fetchRepos = () => {
        setIsLoadingRepos(true);
        setTimeout(() => {
            setRepos(MOCK_REPOS);
            setIsLoadingRepos(false);
        }, 1500);
    };

    // Filter repositories based on search
    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLinkWorkspace = (repoId) => {
        setSyncing(prev => ({ ...prev, [repoId]: true }));

        // Simulate API call
        setTimeout(() => {
            setSyncing(prev => ({ ...prev, [repoId]: false }));
            navigate(role === 'pm' ? "/pm/dashboard" : "/collaborator/dashboard");
        }, 2000);
    };

    const getLanguageColor = (lang) => {
        switch (lang.toLowerCase()) {
            case 'javascript': return "bg-yellow-400/20 text-yellow-400";
            case 'typescript': return "bg-blue-400/20 text-blue-400";
            case 'python': return "bg-green-400/20 text-green-400";
            case 'rust': return "bg-orange-400/20 text-orange-400";
            case 'c++': return "bg-pink-400/20 text-pink-400";
            default: return "bg-gray-400/20 text-gray-400";
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0B0C15] overflow-x-hidden relative flex flex-col">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-nebula-purple/10 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-nebula-cyan/10 blur-[120px] rounded-full animate-float delay-1000" />
            </div>

            {/* Navbar / Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0B0C15]/50 backdrop-blur-xl h-20 transition-all duration-300">
                <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-cyan to-nebula-purple flex items-center justify-center shadow-lg shadow-nebula-cyan/20">
                            <span className="font-bold text-white text-lg">N</span>
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 hidden sm:block">
                            Nebula Flow
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {isConnected ? (
                            <div className="flex items-center gap-4 animate-fade-in-up">
                                <Button
                                    variant="outline"
                                    className="border-white/10 bg-nebula-cyan/10 text-nebula-cyan px-4 py-2 hover:bg-nebula-cyan/20"
                                >
                                    Create Collaboration
                                </Button>
                                <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden md:block">
                                        <div className="text-sm font-medium text-white">{user?.name || "User"}</div>
                                        <button
                                            onClick={async () => {
                                                setIsConnected(false);
                                                await logout();
                                                navigate('/login');
                                            }}
                                            className="text-xs text-white/50 hover:text-white transition-colors flex items-center justify-end gap-1 ml-auto"
                                        >
                                            Log out <LogOut className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <Avatar className="h-10 w-10 border-2 border-white/10 hover:border-nebula-cyan/50 transition-colors">
                                        <AvatarImage src={`https://github.com/shadcn.png`} />
                                        <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        ) : (
                            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" disabled>
                                Not Connected
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-32 pb-24 px-4 container mx-auto max-w-7xl flex-grow flex flex-col items-center">

                {!isConnected ? (
                    <div className="flex flex-col items-center justify-center flex-grow text-center space-y-8 animate-fade-in-up mt-10">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                            <Github className="w-12 h-12 text-white" />
                        </div>
                        <div className="space-y-4 max-w-lg">
                            <h2 className="text-4xl font-bold text-white tracking-tight">Connect your GitHub</h2>
                            <p className="text-lg text-white/60">
                                Link your GitHub account to access your repositories and sync your workspace with Nebula Flow.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleConnectObj}
                            disabled={isConnecting}
                            className="bg-white text-black hover:bg-white/90 font-semibold px-8 h-14 rounded-full text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Github className="mr-2 h-5 w-5" />
                                    Connect to GitHub
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Search Bar */}
                        <div className="w-full max-w-3xl mb-12 animate-fade-in-up">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-nebula-cyan via-nebula-purple to-nebula-pink rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                    <input
                                        type="text"
                                        placeholder="Search your repositories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-nebula-purple/50 focus:ring-1 focus:ring-nebula-purple/50 backdrop-blur-xl transition-all shadow-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Repo Grid */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                            {isLoadingRepos ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <GlassCard key={i} className="h-64 flex flex-col p-6 space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32 bg-white/10" />
                                                <Skeleton className="h-3 w-20 bg-white/10" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-16 w-full bg-white/10" />
                                        <div className="flex gap-2 pt-4">
                                            <Skeleton className="h-6 w-16 bg-white/10" />
                                            <Skeleton className="h-6 w-16 bg-white/10" />
                                        </div>
                                    </GlassCard>
                                ))
                            ) : filteredRepos.length > 0 ? (
                                filteredRepos.map((repo) => (
                                    <GlassCard key={repo.id} className="group relative overflow-hidden flex flex-col h-full">
                                        {/* Hover Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-nebula-cyan/5 to-nebula-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="relative p-6 flex-grow space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-white/5 text-nebula-cyan group-hover:bg-nebula-cyan/20 transition-colors">
                                                        <Folder className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white group-hover:text-nebula-cyan transition-colors">
                                                            {repo.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Clock className="w-3 h-3 text-white/30" />
                                                            <p className="text-xs text-white/50">Last active: {repo.updatedAt}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-white/60 line-clamp-2">{repo.description}</p>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className={`border-0 ${repo.isPrivate ? 'bg-white/5 text-white/70' : 'bg-nebula-cyan/10 text-nebula-cyan'}`}>
                                                    {repo.isPrivate ? 'Private' : 'Public'}
                                                </Badge>
                                                <Badge variant="outline" className={`border-0 ${getLanguageColor(repo.language)}`}>
                                                    {repo.language}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-6 pt-0 mt-auto">
                                            <Button
                                                onClick={() => handleLinkWorkspace(repo.id)}
                                                disabled={syncing[repo.id]}
                                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-nebula-cyan/50 text-white relative overflow-hidden group/btn"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-nebula-cyan/20 to-nebula-purple/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                <span className="relative flex items-center justify-center gap-2">
                                                    {syncing[repo.id] ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Linking...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Link Workspace
                                                            <ArrowLeft className="w-4 h-4 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </span>
                                            </Button>
                                        </div>
                                    </GlassCard>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-medium text-white mb-2">No Repositories Found</h3>
                                    <p className="text-white/50">We couldn't find any repositories matching "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Footer / Back Button */}
            <div className="fixed bottom-6 left-6 z-50">
                <Button
                    variant="ghost"
                    className="text-white/50 hover:text-white hover:bg-white/5 backdrop-blur-md gap-2 pl-2"
                    onClick={() => navigate("/login")}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Role Selection
                </Button>
            </div>
        </div>
    );
};

export default RepositorySelection;
