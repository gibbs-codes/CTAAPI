import React, {useEffect, useState} from "react";

export default function Events(){
    const [today, setToday] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        updateToday();
    }, [])
    
    async function updateToday() {
        fetch(process.env.REACT_APP_EVENTS_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => { 
            let events = data.map(event => {
                return ` ${event.summary} : ${event.start}` 
            })
            setToday(events);
        }).catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        })
        setLoading(false);
    }

    
    return (
        <div>
            {loading ? <></> :
                <div>
                    <p>Today's Events:</p>
                    {today &&
                    today.map((event, index) => (
                        <div key={index}>{event}</div>
                    ))}
                </div>
            }
        </div>
    )

}