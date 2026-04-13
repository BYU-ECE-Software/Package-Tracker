interface PageTitleProps {
  title: string;
}

// Page Title. On the view, you set what you want the title to actually render and say
const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <header className="w-full bg-[#F6F6F8] text-[#141414] py-14 px-6">
        <div className="flex justify-center items-center">
          <h1 className="text-4xl font-semibold tracking-widest">{title}</h1>
        </div>
      </header>
    </div>
  );
};

export default PageTitle;
