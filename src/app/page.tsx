import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import Dedicated from "@/components/dedicated"
import KeyFeatures from "@/components/keyFeatures"
import BookAppointment from "@/components/bookAppointment"
import Slider from "@/components/slider"
import GetDoctor from "@/components/getdoctor"
import Footer from "@/components/footer"

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Dedicated />
      <KeyFeatures />
      <BookAppointment />
      <Slider />
      <GetDoctor />
      <Footer />
    </div>
  )
}

export default HomePage;