import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import Dedicated from "@/components/dedicated"
import KeyFeatures from "@/components/keyFeatures"
import BookAppointment from "@/components/bookAppointment"

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Dedicated />
      <KeyFeatures />
      <BookAppointment />
    </div>
  )
}

export default HomePage;