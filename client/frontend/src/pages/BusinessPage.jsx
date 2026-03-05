import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import DetailsPage from '../components/DetailsPage';
const BusinessPage = () => {
    const { id } = useParams();
    const [business, setBusiness] = useState();
    useEffect(() => {
        getBusiness();
    }, []);
    const getBusiness = async () => {
        try {
            const response = await fetch('https://tsarepo-production.up.railway.app/api/getBusiness/', {
                method: 'POST',
                body: JSON.stringify({ place_id: id }),
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setBusiness(data);
            console.log('Business Data:', data);
        }
        catch (error) {
            console.error('Error fetching business data:', error);
        }
    }
    return (
        <div>
        <RootLayout />
        <DetailsPage data = {business} />
        </div>
    )
}

export default BusinessPage