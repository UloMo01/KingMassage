// Updated code to display prices for extra time options

const extraTimeOptions = [
    { duration: "+15 minutes", price: 150 },
    { duration: "+30 minutes", price: 250 },
    { duration: "+45 minutes", price: 350 }
];

const displayExtraTimeOptions = () => {
    return extraTimeOptions.map(option => {
        return `${option.duration} - ₱${option.price}`;
    }).join('\n');
};

console.log(displayExtraTimeOptions()); // For testing
