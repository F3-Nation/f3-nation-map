import { auth, signIn, signOut } from "@f3/auth";
import { Button } from "@f3/ui/button";

export async function AuthShowcase() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex flex-row items-center gap-4">
        <h2 className="text-2xl font-semibold">Auth Showcase</h2>
        <form>
          <Button
            size="lg"
            formAction={async () => {
              "use server";
              await signIn("discord");
            }}
          >
            Sign in with Discord
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">Auth Showcase</h2>
      <p className="text-center text-2xl">
        {session && (
          <span>Logged in as {session.user?.name ?? session.user?.email}</span>
        )}
      </p>

      <form>
        <Button
          size="lg"
          formAction={async () => {
            "use server";
            await signOut();
          }}
        >
          Sign out
        </Button>
      </form>
    </div>
  );
}
