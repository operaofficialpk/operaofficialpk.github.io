import { Link } from "react-router-dom";


function Categories() {


  const categories = [

    {
      name: "Necklaces",
      image:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338"
    },

    {
      name: "Earrings",
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"
    },

    {
      name: "Bridal Sets",
      image:
        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0"
    }

  ];



  return (

    <section className="py-20 px-6">


      <h2 className="text-4xl font-bold text-center mb-12">

        Shop By Category

      </h2>



      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">


        {categories.map((category, index) => (


          <Link

            key={index}

            to="/shop"

            className="group"

          >


            <div className="overflow-hidden rounded-3xl shadow-lg">


              <img

                src={category.image}

                alt={category.name}

                className="w-full h-80 object-cover group-hover:scale-110 transition duration-500"

              />


            </div>



            <h3 className="text-2xl font-bold text-center mt-5">

              {category.name}

            </h3>


          </Link>


        ))}


      </div>


    </section>

  );

}


export default Categories;