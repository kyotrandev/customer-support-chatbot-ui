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
        setError("Không tìm thấy mã truy cập");
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
            setError(response.error || "Không thể tải thông tin hồ sơ");
          }
        } catch (err) {
          setError("Đã xảy ra lỗi khi tải thông tin hồ sơ");
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
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
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
        toast.success("Cập nhật thông tin thành công");
      } else {
        toast.error(response.error || "Cập nhật thông tin thất bại");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi cập nhật thông tin");
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
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/auth/login")}>Quay lại trang đăng nhập</Button>
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
            Trở về Trang chủ
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Cài đặt Hồ sơ
          </h1>
          <p className="text-slate-300 mt-2">
            Quản lý thông tin tài khoản và tùy chọn cá nhân
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
                Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger 
                value="edit" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Chỉnh sửa thông tin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription className="text-slate-300">
                    Thông tin cá nhân của bạn được hiển thị bên dưới
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Tên đăng nhập</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{session?.user.username || "Chưa cập nhật"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Họ và tên</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.name || "Chưa cập nhật"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Ngày sinh</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.dateOfBirth || "Chưa cập nhật"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Tuổi</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.age || "Chưa cập nhật"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Chiều cao</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.height ? `${profile.height} cm` : "Chưa cập nhật"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Cân nặng</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.weight ? `${profile.weight} kg` : "Chưa cập nhật"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-indigo-300">Chỉ số BMI</h3>
                        <p className="text-base bg-white/5 p-2 rounded-md">{profile.bmi ? profile.bmi.toFixed(1) : "Chưa cập nhật"}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Không có thông tin hồ sơ</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px] border-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    onClick={() => setTabValue("edit")}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Cập nhật thông tin
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px] border-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    onClick={() => router.push("/auth/change-password")}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Đổi mật khẩu
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="edit">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Cập nhật thông tin</CardTitle>
                  <CardDescription className="text-slate-300">
                    Cập nhật thông tin cá nhân của bạn
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
                              <FormLabel className="text-white">Họ và tên</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nhập họ và tên" 
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
                              <FormLabel className="text-white">Ngày sinh</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="DD-MM-YYYY" 
                                  {...field} 
                                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400"
                                />
                              </FormControl>
                              <FormDescription className="text-slate-400">
                                Định dạng: DD-MM-YYYY (ví dụ: 07-06-2004)
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
                              <FormLabel className="text-white">Chiều cao (cm)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  placeholder="Nhập chiều cao" 
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
                              <FormLabel className="text-white">Cân nặng (kg)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1" 
                                  placeholder="Nhập cân nặng" 
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
                          Hủy bỏ
                        </Button>
                        <Button 
                          variant="outline" 
                          type="submit"
                          className="border-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                        >
                          Lưu thay đổi
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