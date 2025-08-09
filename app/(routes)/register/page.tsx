import RegisterForm from "./components/RegisterForm";

export default function Page() {
  return (
    <div className="bg-[#FBE6D4] w-full min-h-screen flex items-center justify-center px-4 py-12 md:py-0">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
