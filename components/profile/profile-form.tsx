"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAccountInfo, updateAccountInfo } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, User, Pencil, Key } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { profileSchema } from "@/schemas";
import NavBarHome from "@/components/Homepage/Navbar";

type ProfileData = z.infer<typeof profileSchema> & {
  age?: number;
  bmi?: number;
};

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState("profile");

  // Initialize form
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      name: "",
      dateOfBirth: "",
      height: 0,
      weight: 0,
    },
  });

  // Load profile from localStorage or API
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        router.push("/auth/login");
        return;
      }

      if (!session?.tokens?.accessToken) {
        setError("Access token not found");
        setLoading(false);
        return;
      }

      // Check localStorage first
      const storedProfile = localStorage.getItem("profile");
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile);
        setProfile(profileData);
        form.reset({
          username: session.user.username || "",
          name: profileData.name || "",
          dateOfBirth: profileData.dateOfBirth || "",
          height: profileData.height || 0,
          weight: profileData.weight || 0,
        });
        setLoading(false);
      } else {
        // Only call API if no data in localStorage
        setLoading(true);
        setError(null);

        try {
          const response = await getAccountInfo(session.user.username);
          if (response.success && response.data) {
            const profileData = response.data.data || {};
            setProfile(profileData);
            localStorage.setItem("profile", JSON.stringify(profileData));
            form.reset({
              username: session.user.username || "",
              name: profileData.name || "",
              dateOfBirth: profileData.dateOfBirth || "",
              height: profileData.height || 0,
              weight: profileData.weight || 0,
            });
          } else {
            setError(response.error || "Could not load profile information");
          }
        } catch (err) {
          setError("An error occurred while loading profile information");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [router, form, session, status]);

  // Handle information update
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      if (!session?.tokens?.accessToken) {
        toast.error("You need to be logged in to perform this action");
        return;
      }

      const response = await updateAccountInfo({
        username: values.username,
        name: values.name,
        dateOfBirth: values.dateOfBirth,
        height: values.height,
        weight: values.weight,
      });

      if (response.success) {
        const updatedProfile = {
          ...values,
          age: profile?.age,
          bmi: profile?.bmi,
        };
        setProfile(updatedProfile);
        localStorage.setItem("profile", JSON.stringify(updatedProfile)); // Save to localStorage
        setTabValue("profile");
        toast.success("Information updated successfully");
      } else {
        toast.error(response.error || "Failed to update information");
      }
    } catch (err) {
      toast.error("An error occurred while updating information");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950">
        <NavBarHome session={session} />
        <div className="pt-24 px-4 container max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950">
        <NavBarHome session={session} />
        <div className="pt-24 px-4 container max-w-4xl mx-auto">
          <Alert variant="destructive" className="bg-red-500/10 border border-red-500/50 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/auth/login")}>Return to login page</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
      <NavBarHome session={session} />
      
      <div className="pt-24 px-4 container max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/" className="text-indigo-300 hover:text-indigo-200 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Profile Settings
          </h1>
          <p className="text-slate-300 mt-2">
            Manage your account information and preferences
          </p>
        </div>
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
          <Tabs value={tabValue} onValueChange={setTabValue} className="relative z-10">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Personal Information
              </TabsTrigger>
              <TabsTrigger 
                value="edit" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Information
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription className="text-slate-300">
                    Your personal information is displayed below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Username</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{session?.user.username || "Not updated"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Full Name</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.name || "Not updated"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Date of Birth</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.dateOfBirth || "Not updated"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Age</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.age || "Not updated"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Height</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.height ? `${profile.height} cm` : "Not updated"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Weight</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.weight ? `${profile.weight} kg` : "Not updated"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">BMI</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.bmi ? profile.bmi.toFixed(1) : "Not updated"}</p>
                      </div>
                    </div>
                  ) : (
                    <p>No profile information available</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px] border-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    onClick={() => setTabValue("edit")}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Update Information
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px] border-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    onClick={() => router.push("/auth/change-password")}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="edit">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Update Information</CardTitle>
                  <CardDescription className="text-slate-300">
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter full name" 
                                  {...field} 
                                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400"
                                />
                              </FormControl>
                              <FormMessage className="text-pink-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Date of Birth</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="DD-MM-YYYY" 
                                  {...field} 
                                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400"
                                />
                              </FormControl>
                              <FormDescription className="text-slate-400">
                                Format: DD-MM-YYYY (example: 07-06-2004)
                              </FormDescription>
                              <FormMessage className="text-pink-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Height (cm)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  placeholder="Enter height" 
                                  {...field} 
                                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400"
                                />
                              </FormControl>
                              <FormMessage className="text-pink-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Weight (kg)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  placeholder="Enter weight" 
                                  {...field} 
                                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400"
                                />
                              </FormControl>
                              <FormMessage className="text-pink-300" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <Button 
                          variant="outline" 
                          type="button" 
                          onClick={() => setTabValue("profile")}
                          className="border-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="outline" 
                          type="submit"
                          className="border-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 bg-white/10" />
        <Skeleton className="h-4 w-full max-w-md bg-white/10" />
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="space-y-4 mb-6">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-4 w-full max-w-sm bg-white/10" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16 bg-white/10" />
              <Skeleton className="h-10 w-full bg-white/10" />
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-10 w-32 bg-white/10" />
          <Skeleton className="h-10 w-32 bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;