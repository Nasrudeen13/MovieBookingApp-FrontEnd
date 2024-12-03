import React, { useState, useEffect} from 'react'
import {useParams, useSearchParams } from 'react-router-dom'
import { useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import './Screen.css'

const Screen = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const params = useParams()
    const [searchParams,setSearchParams] = useSearchParams()

    const date = searchParams.get('date')
    const {movieid, city , screenid} = params

    console.log(movieid,city,screenid,date)

    const [screen, setScreen] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)



    const getschedules = async () => {
        fetch(`http://localhost:8000/movie/schedulebymovie/${screenid}/${date}/${movieid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(response => {
                if (response.ok) {
                    console.log(response.data)
                    setScreen(response.data)
                    setSelectedTime(response.data.movieSchedulesforDate[0])
                }
                else {
                    console.log(response)
                }
            })
            .catch(err => console.log(err))

    }

    const [movie, setMovie] = useState(null)


    const getMovie = async () => {
        fetch(`http://localhost:8000/movie/movies/${movieid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.ok) {
                    console.log('movie', data.data)
                    setMovie(data.data)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

 useEffect(() => {
        getschedules()
        getMovie()
    }, [])


    const [selectedSeats, setSelectedSeats] = useState([])
    const selectdeselectseat = (seat) => {
        console.log(seat)
        // {
        //     "row": "F",
        //     "col": 1,
        //     "seat_id": "6",
        //     "price": 500
        // }
        const isselected = selectedSeats.find((s) => (
            s.row === seat.row &&
            s.col === seat.col &&
            s.seat_id === seat.seat_id
        ))

        if (isselected) {
            setSelectedSeats(selectedSeats.filter((s) => (
                s.row !== seat.row ||
                s.col !== seat.col ||
                s.seat_id !== seat.seat_id
            )))
        }

        else {
            setSelectedSeats([...selectedSeats, seat])
        }
    }


    const generateSeatLayout = () => {
        const x = screen.movieSchedulesforDate.findIndex((t) => t.showTime === selectedTime.showTime)
     
        let notavailableseats = screen.movieSchedulesforDate[x].notAvailableSeats
    

        return (
            <div className='container-fluid'>
                {screen.screen.seats.map((seatType, index) => (
                    <div className="seat-type container" key={index} >
                        <h2>{seatType.type} - Rs. {seatType.price}</h2>
                        <div className='seat-rows container'>
                            {seatType.rows.map((row, rowIndex) => (
                                <div className="seat-row container" key={rowIndex}>
                                    <p className="rowname">{row.rowname}</p>
                                    <div className="seat-cols container">
                                        {row.cols.map((col, colIndex) => (


                                            <div className="seat-col " key={colIndex}>
                                                {col.seats.map((seat, seatIndex) => (
                                                    // console.log(seat),

                                                    <div key={seatIndex} >
                                                        {
                                                            notavailableseats.find((s) => (
                                                                s.row === row.rowname &&
                                                                s.seat_id === seat.seat_id &&
                                                                s.col === colIndex
                                                            )) ?
                                                                <span className='seat-unavailable'>
                                                                    {seatIndex + 1}
                                                                </span>
                                                                :
                                                                <span className={
                                                                    selectedSeats.find((s) => (
                                                                        s.row === row.rowname &&
                                                                        s.seat_id === seat.seat_id &&
                                                                        s.col === colIndex
                                                                    )) ? "seat-selected" : "seat-available"
                                                                }
                                                                    onClick={() => selectdeselectseat({
                                                                        row: row.rowname,
                                                                        col: colIndex,
                                                                        seat_id: seat.seat_id,
                                                                        price: seatType.price
                                                                    })}
                                                                >
                                                                    {seatIndex + 1}
                                                                </span>

                                                        }
                                                    </div>
                                                    // <div key={seatIndex}>
                                                    //     {seat.status === 'available' &&
                                                    //         <span className={
                                                    //             selectedSeats.find((s: any) => (
                                                    //                 s.row === row.rowname &&
                                                    //                 s.seat_id === seat.seat_id &&
                                                    //                 s.col === colIndex
                                                    //             )) ? "seat-selected" : "seat-available"
                                                    //         }
                                                    //         onClick={() => selectdeselectseat({
                                                    //             row: row.rowname,
                                                    //             col: colIndex,
                                                    //             seat_id: seat.seat_id,
                                                    //             price: seatType.price
                                                    //         })}
                                                    //     >
                                                    //         {seatIndex + 1}
                                                    //     </span>
                                                    //     }
                                                    //     {seat.status === 'not-available' &&
                                                    //         <span className="seat-unavailable">
                                                    //             {seatIndex + 1}
                                                    //         </span>
                                                    //     }
                                                    // </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <br /> <br /> <br />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };


    const handleBooking = () => {


        fetch(`http://localhost:8000/movie/bookticket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                showTime: selectedTime.showTime,
                showDate: date,
                movieId: movieid,
                screenId: screenid,
                seats: selectedSeats,
                totalPrice: selectedSeats.reduce((acc, seat) => acc + seat.price, 0),
                paymentId: '123456789',
                paymentType: 'online'
            })

        })
            .then(res => res.json())
            .then(response => {
                if (response.ok) {
                    toast.success('Booking Successful')
                    console.log(response)
                }
                else {
                    console.log(response)
                }
            })
            .catch(err => console.log(err))
    }


    // const movie ={
    //     moviename:'Kanguva',
    //     date:new Date(),
    //     language:'Tamil',
    //     type:'Action/Thriller',
    //     screens:[
    //       {
    //         name:"Screen 1",
    //         location:"PVR Cinemas,Forum Mall,Koramangala"
    //       },
    //       {
    //         name:"Screen 2",
    //         location:"PVR Cinemas,Forum Mall,Koramangala"
    //       },
    //       {
    //         name:"Screen 3",
    //         location:"PVR Cinemas,Forum Mall,Koramangala"
    //       },
    
    //     ]
    //   }

    //    const screen ={ 

    //     name:"Screen 1",
    //     location:"PVR Cinema, Forum Mall, Koramangala",
    //     timeslots:[
    //         {
    //             time:'10:00 AM',
    //             seats:[
    //                 {
                         
    //                 //platinum

    //                     type:'platinum',
    //                     rows:[

    //                         {     
    //                             //row 2
    //                             rowname:'H',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"not-available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"selected",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"not-available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                         {     
    //                             //row 2
    //                             rowname:'G',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                         {     
    //                             //row 2
    //                             rowname:'F',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                     ],
    //                     price:500
    //                 },

    //                 {
                         
    //                     //gold
    
    //                         type:'gold',
    //                         rows:[
    //                             {     
    //                                 //row 2
    //                                 rowname:'E',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
                                
    //                             {     
    //                                 //row 2
    //                                 rowname:'D',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
    //                             {     
    //                                 //row 2
    //                                 rowname:'C',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             }
    //                         ],
    //                         price:300
    //                 },

    //                 {
                         
    //                     //Silver - 20 objects
    
    //                         type:'silver',
    //                         rows:[
    //                             {     
    //                                 //row 2
    //                                 rowname:'B',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
    //                             {     
    //                                 //row 2
    //                                 rowname:'A',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             }
    //                         ],
    //                         price:150
    //                 }
    //             ]
    //         },
    //         {
    //             time:'1:30 PM',
    //             seats:[
    //                 {
                         
    //                 //platinum

    //                     type:'platinum',
    //                     rows:[

    //                         {     
    //                             //row 2
    //                             rowname:'H',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                         {     
    //                             //row 2
    //                             rowname:'G',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                         {     
    //                             //row 2
    //                             rowname:'F',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                     ],
    //                     price:500
    //                 },

    //                 {
                         
    //                     //gold
    
    //                         type:'gold',
    //                         rows:[
    //                             {     
    //                                 //row 2
    //                                 rowname:'E',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
                                
    //                             {     
    //                                 //row 2
    //                                 rowname:'D',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
    //                             {     
    //                                 //row 2
    //                                 rowname:'C',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             }
    //                         ],
    //                         price:300
    //                 },

    //                 {
                         
    //                     //Silver - 20 objects
    
    //                         type:'silver',
    //                         rows:[
    //                             {     
    //                                 //row 2
    //                                 rowname:'B',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
    //                             {     
    //                                 //row 2
    //                                 rowname:'A',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             }
    //                         ],
    //                         price:150
    //                 }
    //             ]
    //         },
    //         {
    //             time:'4:00 PM',
    //             seats:[
    //                 {
                         
    //                 //platinum

    //                     type:'platinum',
    //                     rows:[

    //                         {     
    //                             //row 2
    //                             rowname:'H',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                         {     
    //                             //row 2
    //                             rowname:'G',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                         {     
    //                             //row 2
    //                             rowname:'F',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                     ],
    //                     price:500
    //                 },

    //                 {
                         
    //                     //gold
    
    //                         type:'gold',
    //                         rows:[
    //                             {     
    //                                 //row 2
    //                                 rowname:'E',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
                                
    //                             {     
    //                                 //row 2
    //                                 rowname:'D',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
    //                             {     
    //                                 //row 2
    //                                 rowname:'C',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             }
    //                         ],
    //                         price:300
    //                 },

    //                 {
                         
    //                     //Silver - 20 objects
    
    //                         type:'silver',
    //                         rows:[
    //                             {     
    //                                 //row 2
    //                                 rowname:'B',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
    //                             {     
    //                                 //row 2
    //                                 rowname:'A',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             }
    //                         ],
    //                         price:150
    //                 }
    //             ]
    //         },
    //         {
    //             time:'10:00 PM',
    //             seats:[
    //                 {
                         
    //                 //platinum

    //                     type:'platinum',
    //                     rows:[

    //                         {     
    //                             //row 2
    //                             rowname:'H',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                         {     
    //                             //row 2
    //                             rowname:'G',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                         {     
    //                             //row 2
    //                             rowname:'F',
    //                             cols:[
    //                                 // col 1
    //                                 {
    //                                 seats:[
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'1'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'2'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'3'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'4'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'5'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'6'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'7'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'8'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'9'
    //                                     },
    //                                     {
    //                                         type:"seats",
    //                                         status:"available",
    //                                         seat_id:'10'
    //                                     },
    //                                 ]
    //                                 },
    //                                 // col 2
    //                                 {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"notavailable",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                 }

    //                             ]
    //                         },
    //                     ],
    //                     price:500
    //                 },

    //                 {
                         
    //                     //gold
    
    //                         type:'gold',
    //                         rows:[
    //                             {     
    //                                 //row 2
    //                                 rowname:'E',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
                                
    //                             {     
    //                                 //row 2
    //                                 rowname:'D',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
    //                             {     
    //                                 //row 2
    //                                 rowname:'C',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             }
    //                         ],
    //                         price:300
    //                 },

    //                 {
                         
    //                     //Silver - 20 objects
    
    //                         type:'silver',
    //                         rows:[
    //                             {     
    //                                 //row 2
    //                                 rowname:'B',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             },
    //                             {     
    //                                 //row 2
    //                                 rowname:'A',
    //                                 cols:[
    //                                     // col 1
    //                                     {
    //                                     seats:[
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'1'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'2'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'3'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'4'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'5'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'6'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'7'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'8'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'9'
    //                                         },
    //                                         {
    //                                             type:"seats",
    //                                             status:"available",
    //                                             seat_id:'10'
    //                                         },
    //                                     ]
    //                                     },
    //                                     // col 2
    //                                     {
    //                                         seats:[
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'1'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'2'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'3'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'4'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'5'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'6'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'7'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'8'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"notavailable",
    //                                                 seat_id:'9'
    //                                             },
    //                                             {
    //                                                 type:"seats",
    //                                                 status:"available",
    //                                                 seat_id:'10'
    //                                             },
    //                                         ]
    //                                     }
    
    //                                 ]
    //                             }
    //                         ],
    //                         price:150
    //                 }
    //             ]
    //         },
    //     ]
    //    }

    //    const generateseatLayout=()=>{

    //     const x = screen.timeslots.findIndex((t)=> t.time=== selectedTime.time)
         
    //     const [selectedSeats, setSelectedSeats]= useState([])


    //     const SelectselectedSeats = (seat)=>{
    //       const isselected = selectedSeats.findIndex((s)=>{
    //         return seat.row && s.col === seat.col && s.seat_id === seat.seat_id
    //       })

    //       if(isselected){
    //         // deselect
    //         setSelectedSeats(selectedSeats.filter((s)=>s.seat_id !== seat.seat_id))
    //       }
    //       else{
    //         //select
    //         setSelectedSeats([...selectedSeats,seat])

    //       }
    //     }


    //    return screen.timeslots[x].seats.map((seatType,index)=>(
    //      <div className='seat-type' key={index}>
    //         <h2>{seatType.type} - Rs. {seatType.price}</h2>

    //         <div className='seat-rows'>
    //             {
    //                 seatType.rows.map((row,rowIndex)=>(
    //                     <div className='seat-row' key={rowIndex}>
    //                         <p className='rowname'>{row.rowname}</p>
    //                         <div className='seat-cols'>
    //                             {
    //                                 row.cols.map((col,colIndex)=>(
    //                                     <div className='seat-col' key={colIndex}>
    //                                         {col.seats.map((seat,seatIndex)=>(
    //                                             <div  key={seatIndex}>
    //                                                 {
    //                                                 seat.status == 'available' &&
    //                                                 <span className={
    //                                                     selectedSeats.find((s)=>{
    //                                                         return s.row.rowname && s.seat_id === seat.seat_id && s.col === colIndex
    //                                                     }) ? "seat-selected" : "seat-available"
    //                                                 }
                                                    
    //                                                 onClick={()=> SelectselectedSeats({
    //                                                     row: row.rowname,
    //                                                     col: colIndex,
    //                                                     seat_id:seat.seat_id,
    //                                                     price:seatType.price
    //                                                 })}
                                                    
    //                                                 >
    //                                                     {seatIndex+1}
    //                                                 </span>
    //                                                }
    //                                                  {
    //                                                 seat.status == 'not-available' &&
    //                                                 <span className='seat-unavailable'>
    //                                                     {seatIndex+1}
    //                                                 </span>
    //                                                }
    //                                                {
    //                                                  seat.status == 'selected' &&
    //                                                 <span className='seat-selected'>
    //                                                     {seatIndex+1}
    //                                                 </span>
    //                                                }
    //                                             </div>
    //                                         ))}
    //                                     </div>
    //                                 ))
    //                             }
    //                         </div>
    //                     </div>
    //                 ))
    //             }
    //         </div>
    //      </div>
    //    ))
    // }


    //    const [selectedTime, setSelectedTime] = useState(screen.timeslots[0])
    

  return (
   
    <div className='selectseatpage container-fluid'>
    {
        movie && screen &&
        <div className='s1'>
            <div className='head'>
                <h1>{movie.title} - {screen?.screen?.name}</h1>
                <h3>{movie.genre.join(" / ")}</h3>
            </div>
        </div>
    }

    {
        screen &&
        <div className="selectseat">
            <div className='timecont'>
                {
                    screen.movieSchedulesforDate.map((time, index) => (
                        <h3 className={selectedTime?._id === time._id ? 'time selected' : 'time'} 
                        onClick={() => {
                            setSelectedTime(time)
                            setSelectedSeats([])
                        }} key={index}>
                            {time.showTime}
                        </h3>
                    ))
                }
            </div>
            <div className='indicators'>
                <div>
                    <span className='seat-unavailable'></span>
                    <p>Not available</p>
                </div>
                <div>
                    <span className='seat-available'></span>
                    <p>Available</p>
                </div>
                <div>
                    <span className='seat-selected'></span>
                    <p>Selected</p>
                </div>
            </div>

            {generateSeatLayout()}


            <div className='totalcont'>
                <div className='total'>
                    <h2>Total</h2>
                    <h3>Rs. {selectedSeats.reduce((acc, seat) => acc + seat.price, 0)}</h3>
                </div>

                {/* <Link href="/" className='theme_btn1 linkstylenone'>Continue</Link> */}
                <button
                    className='theme_btn1 linkstylenone'
                    onClick={handleBooking}
                >Book Now</button>
            </div>
        </div>
    }
    {/* 

    <div className="selectseat">
    
       
        
      
    </div> */}
</div>

  )
}

export default Screen