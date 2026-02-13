import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Mail, Slack, Plug, Github, Trello } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PMSettingsPage = () => {
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text">Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
            </motion.div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-muted/20 border border-border/20 p-1 w-full sm:w-auto h-auto grid grid-cols-2 sm:flex sm:inline-flex">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2">
                        <User className="w-4 h-4 mr-2" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="account" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2">
                        <Shield className="w-4 h-4 mr-2" /> Account
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2">
                        <Bell className="w-4 h-4 mr-2" /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 py-2">
                        <Plug className="w-4 h-4 mr-2" /> Integrations
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nebula-card p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer">
                                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                        <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">ME</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-white">Change</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Remove Photo</Button>
                            </div>

                            <div className="flex-1 space-y-4 max-w-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First name</Label>
                                        <Input id="firstName" defaultValue="Alex" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last name</Label>
                                        <Input id="lastName" defaultValue="Morgan" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" defaultValue="@alex_manager" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Input id="bio" defaultValue="Project Manager at Nebula Flow." />
                                </div>
                                <div className="pt-4">
                                    <Button onClick={handleSave} disabled={loading} className="min-w-[100px]">
                                        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-background border-t-transparent rounded-full" /> : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                {/* Account Tab */}
                <TabsContent value="account" className="space-y-6 focus-visible:outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nebula-card p-6 space-y-6 max-w-2xl">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Email Addresses</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border border-border/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">alex@nebula.dev</p>
                                            <p className="text-xs text-muted-foreground">Primary</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>
                                </div>
                                <Button variant="outline" size="sm" className="mt-2 text-xs">Add Email Address</Button>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h3>
                            <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-400">Delete Account</p>
                                    <p className="text-xs text-muted-foreground">Permanently remove your account and all of its contents.</p>
                                </div>
                                <Button variant="destructive" size="sm">Delete Account</Button>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6 focus-visible:outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nebula-card p-6 max-w-2xl">
                        <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
                        <div className="space-y-6">
                            {[
                                { title: 'Email Notifications', desc: 'Receive daily summaries and critical alerts.', icon: Mail },
                                { title: 'Push Notifications', desc: 'Real-time updates for mentions and assignments.', icon: Bell },
                                { title: 'Slack Integration', desc: 'Forward project updates to connected Slack channels.', icon: Slack },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-muted/20 rounded-lg text-muted-foreground">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked={i === 0} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-6 focus-visible:outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nebula-card p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: 'GitHub', desc: 'Sync repositories, issues, and PRs.', icon: Github, connected: true, color: 'text-foreground' },
                                { name: 'Slack', desc: 'Communication and alerting channels.', icon: Slack, connected: true, color: 'text-purple-400' },
                                { name: 'Jira', desc: 'Issue tracking and agile boards.', icon: Trello, connected: false, color: 'text-blue-500' },
                            ].map((app, i) => (
                                <Card key={i} className={`bg-card/50 border-border/40 transition-all ${app.connected ? 'border-primary/40 shadow-[0_0_15px_-5px_hsl(187_100%_50%_/_0.1)]' : 'opacity-80'}`}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <app.icon className={`w-5 h-5 ${app.color}`} />
                                            {app.name}
                                        </CardTitle>
                                        {app.connected ? (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] py-0">Connected</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] py-0">Not Connected</Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-xs mb-4">{app.desc}</CardDescription>
                                        <div className="flex items-center justify-between">
                                            <Switch defaultChecked={app.connected} />
                                            <Button variant="ghost" size="sm" className="h-7 text-xs">Configure</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                </TabsContent>

            </Tabs>
        </div>
    );
};

export default PMSettingsPage;
