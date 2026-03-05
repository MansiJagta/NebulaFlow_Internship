import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Search,
    Folder,
    GitBranch,
    Star,
    Clock,
    LogOut,
    User,
    ArrowLeft,
    Loader2,
    Github
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const RepositorySelection = () => {
    const navigate = useNavigate();
    const { user, role, logout, setRepo } = useAuth();

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [syncing, setSyncing] = useState({});
    const [repos, setRepos] = useState([]);

    const BACKEND_URL = "http://localhost:5000"; // your backend URL

    // Connect GitHub account (redirects to backend OAuth route)
    const handleConnectObj = () => {
        setIsConnecting(true);
        window.location.href = `${BACKEND_URL}/api/auth/github`;
    };

    // Fetch repos from backend after OAuth
    const fetchRepos = async () => {
        setIsLoadingRepos(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/auth/github/repos`, {
                withCredentials: true,
            });
            setRepos(res.data);
            if (res.data.length > 0) setIsConnected(true);
        } catch (err) {
            console.error("Error fetching GitHub repos:", err);
        }
        setIsLoadingRepos(false);
    };

    useEffect(() => {
        fetchRepos();
    }, []);

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLinkWorkspace = (repo) => {
        setSyncing(prev => ({ ...prev, [repo.id]: true }));

        // Save the full repo object so GitHub page & Members page can use it
        setRepo({
            id: repo.id,
            name: repo.name,
            full_name: repo.fullName || `${repo.owner || ''}/${repo.name}`,
            description: repo.description,
            language: repo.language,
            stars: repo.stars,
            forks: repo.forks,
            owner: repo.owner || (repo.fullName || '').split('/')[0],
            private: repo.isPrivate ?? repo.private ?? false,
        });

        setTimeout(() => {
            setSyncing(prev => ({ ...prev, [repo.id]: false }));
            navigate(role === 'pm' ? "/pm/dashboard" : "/collaborator/dashboard");
        }, 800);
    };

    const getLanguageColor = (lang) => {
        switch ((lang || "").toLowerCase()) {
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

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0B0C15]/50 backdrop-blur-xl h-20">
                <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-cyan to-nebula-purple flex items-center justify-center shadow-lg shadow-nebula-cyan/20">
                            <span className="font-bold text-white text-lg">N</span>
                        </div>
                        <h1 className="text-xl font-bold text-white hidden sm:block">
                            Nebula Flow
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {isConnected ? (
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    className="border-white/10 bg-nebula-cyan/10 text-nebula-cyan px-4 py-2 hover:bg-nebula-cyan/20"
                                >
                                    Create Collaboration
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-3 focus:outline-none">
                                            <div className="text-right hidden md:block">
                                                <div className="text-sm font-medium text-white">{user?.name || "User"}</div>
                                                <div className="text-xs text-white/50">
                                                    {role || "collaborator"}
                                                </div>
                                            </div>
                                            <Avatar className="h-10 w-10 border-2 border-white/10 hover:border-nebula-cyan/50 transition-colors">
                                                <AvatarImage src={user?.avatar} />
                                                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[10rem]">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{user?.name || "User"}</span>
                                                <span className="text-xs text-muted-foreground">{role || "collaborator"}</span>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => navigate("/settings")}
                                            className="cursor-pointer"
                                        >
                                            Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={async () => {
                                                await logout();
                                                navigate("/login");
                                            }}
                                            className="cursor-pointer text-red-400 focus:text-red-400"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" disabled>
                                Not Connected
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="relative z-10 pt-32 pb-24 px-4 container mx-auto max-w-7xl flex-grow flex flex-col items-center">

                {!isConnected ? (
                    <div className="flex flex-col items-center justify-center flex-grow text-center space-y-8 mt-10">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                            <Github className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight">Connect your GitHub</h2>
                        <p className="text-lg text-white/60">Link your GitHub account to access your repositories.</p>
                        <Button
                            size="lg"
                            onClick={handleConnectObj}
                            disabled={isConnecting}
                            className="bg-white text-black hover:bg-white/90 font-semibold px-8 h-14 rounded-full text-lg"
                        >
                            {isConnecting ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Github className="mr-2 h-5 w-5" />
                            )}
                            {isConnecting ? "Connecting..." : "Connect to GitHub"}
                        </Button>
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {isLoadingRepos ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <GlassCard key={i} className="h-64 flex flex-col p-6 space-y-4">
                                    <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                                    <Skeleton className="h-4 w-32 bg-white/10" />
                                    <Skeleton className="h-3 w-20 bg-white/10" />
                                    <Skeleton className="h-16 w-full bg-white/10" />
                                </GlassCard>
                            ))
                        ) : filteredRepos.length > 0 ? (
                            filteredRepos.map((repo) => (
                                <GlassCard key={repo.id} className="group relative overflow-hidden flex flex-col h-full">
                                    <div className="relative p-6 flex-grow space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-white/5 text-nebula-cyan">
                                                    <Folder className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Clock className="w-3 h-3 text-white/30" />
                                                        <p className="text-xs text-white/50">Last active: {repo.updatedAt}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-white/60 line-clamp-2">{repo.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className={`border-0 ${repo.private ? 'bg-white/5 text-white/70' : 'bg-nebula-cyan/10 text-nebula-cyan'}`}>
                                                {repo.private ? 'Private' : 'Public'}
                                            </Badge>
                                            <Badge variant="outline" className={`border-0 ${getLanguageColor(repo.language)}`}>
                                                {repo.language || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-6 pt-0 mt-auto">
                                        <Button
                                            onClick={() => handleLinkWorkspace(repo)}
                                            disabled={syncing[repo.id]}
                                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                                        >
                                            {syncing[repo.id] ? "Linking..." : "Link Workspace"}
                                        </Button>
                                    </div>
                                </GlassCard>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                <h3 className="text-xl font-medium text-white mb-2">No Repositories Found</h3>
                                <p className="text-white/50">We couldn't find any repositories matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <div className="fixed bottom-6 left-6 z-50">
                <Button
                    variant="ghost"
                    className="text-white/50 hover:text-white hover:bg-white/5"
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