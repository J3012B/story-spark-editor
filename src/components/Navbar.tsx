
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-spark-purple" />
          <span className="font-bold text-xl">Story Spark Editor</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.picture} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="flex justify-between">
                  <span>{user.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="flex justify-between text-xs text-muted-foreground">
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="opacity-0">
              <Avatar>
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
