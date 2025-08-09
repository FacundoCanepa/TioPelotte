import LoginForm from "./components/LoginForm";

export default function Page() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 md:py-0">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
