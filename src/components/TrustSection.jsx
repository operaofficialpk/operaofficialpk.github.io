function TrustSection() {


  const features = [

    {
      title: "Premium Quality",
      text: "Luxury jewellery with elegant finishing and premium designs."
    },

    {
      title: "Worldwide Shipping",
      text: "We deliver your favourite jewellery worldwide."
    },

    {
      title: "Secure Shopping",
      text: "Safe and easy ordering through WhatsApp."
    },

    {
      title: "Customer Support",
      text: "Our team is always ready to assist you."
    }

  ];



  return (

    <section className="py-20 bg-gray-50 px-6">


      <div className="max-w-6xl mx-auto">


        <h2 className="text-4xl font-bold text-center mb-12">

          Why Choose Opera Official PK

        </h2>



        <div className="grid md:grid-cols-4 gap-8">


          {features.map((item, index) => (


            <div

              key={index}

              className="bg-white p-8 rounded-3xl text-center shadow hover:shadow-xl transition"

            >


              <h3 className="text-xl font-bold mb-4">

                {item.title}

              </h3>



              <p className="text-gray-600 leading-7">

                {item.text}

              </p>


            </div>


          ))}


        </div>


      </div>


    </section>

  );

}


export default TrustSection;