
import Image from "next/image"
import Link from "next/link"
import img1 from "../../public/img/img1.jpg"
import img2 from "../../public/img/img2.jpg"
import img3 from "../../public/img/img3.jpg"
import img4 from "../../public/img/img4.jpg"
import { FaArrowRightLong } from "react-icons/fa6";



const HomePage = () => {
  return (
    <div className="imgs">
      <div className="imgs_wrapper">
        <div className="custom_img_upload">
          <h1>
            <Link href={"/photos"}>
              Recreate your image by uploading any image you want <FaArrowRightLong size={25} />
            </Link>
          </h1>
          <p>or you can test the pictures below.</p>
        </div>
        <div className="img_list">
          <div className="img_content">
            <Image src={img1} width={500} height={350} alt="randomImg" priority={true}  />
            <p>Original size: 3200 x 3000 </p>
            <Link href={"/photos?photoid=1"}>
              Go picture customization
              <FaArrowRightLong size={15} />
            </Link>
          </div>
          <div className="img_content">
            <Image src={img2} width={500} height={350} alt="randomImg" priority={true} />
            <p>Original size: 640 x 960 </p>
            <Link href={"/photos?photoid=2"}>
              Go picture customization
              <FaArrowRightLong size={15}/>
            </Link>
          </div>
          <div className="img_content">
            <Image src={img3} width={500} height={350} alt="randomImg" priority={false} />
            <p>Original size: 1000 x 667 </p>
            <Link href={"/photos?photoid=3"}>
              Go picture customization
              <FaArrowRightLong size={15}/>
            </Link>
          </div>
          <div className="img_content">
            <Image src={img4} width={500} height={350} alt="randomImg" priority={false} />
            <p>Original size: 667 x 1000 </p>
            <Link href={"/photos?photoid=4"}>
              Go picture customization
              <FaArrowRightLong size={15}/>
            </Link>
          </div>
        </div>
      </div>
    </div> 
  )
}

export default HomePage