import DefaultLayout from "@/layouts/default";
import Dashboard from "@/components/dashboard";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <div className="flex flex-col justify-center items-center w-full gap-2">
        <div className="flex flex-col gap-4 justify-around w-full">
          <Dashboard /> 
        </div>
      </div>
    </DefaultLayout>
  );
}