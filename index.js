const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema} =require("./schema.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const MONGO_URl="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URl);
};


app.get("/",(req,res)=>{
    res.send("Hi, i am root");
});

app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

//New route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listings= await Listing.findById(id);

    res.render("listings/show.ejs",{listings});

}));

//create route
app.post("/listings",wrapAsync(async (req,res,next)=>{
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    const newListing  = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    
  
})
);

//Edit route
app.get("/listings/:id/edit",wrapAsync( async (req,res)=>{
    let {id} = req.params;
    const listings = await Listing.findById(id);
    res.render("listings/edit.ejs", {listings});
}));

//update route
app.put("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

//delete route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));
// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Bastar",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found!"));
// });
app.use((err,req,res,next)=>{
    let {statusCode= 500 , message="Page not found"}= err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});

});

app.listen(8080, ()=>{
    console.log("Server is Listening to port 8080");

});
