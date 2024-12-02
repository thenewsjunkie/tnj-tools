import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full hover:bg-accent"
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5 text-yellow-200 transition-all hover:text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-gray-800 transition-all hover:text-gray-600" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}