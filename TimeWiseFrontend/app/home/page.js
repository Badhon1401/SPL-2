import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import Navbar from "@/components/Navbar";

const HomePage = () => {
  return (
    <>
      <Navbar/>
      <SidebarLeft/>
      <SidebarRight/>
    </>
  );
};

export default HomePage;