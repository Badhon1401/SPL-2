// app/home/page.js

import WelcomeMessage from "@/components/WelcomeMessage";
import Task from "@/components/Task";
import Progress from "@/components/Progress";
import Performance from "@/components/Performance";
import Session from "@/components/Session";


const Home = () => {
  return (
    <>
      <div className="home-container">
        {/* WelcomeMessage could be part of the homepage if needed */}
        {/* <WelcomeMessage /> */}
        <Task />
            <Progress />
            <Performance />
            {/* <Notifications />
            <Reminders />
            <Feedback />
            <Team />
            <Goal />
            <Session /> */}
      </div>
    </>
  );
};

export default Home;
