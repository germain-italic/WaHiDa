import React from 'react';

const Header = ({ setFilter }) => {
    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">WaHiDa</h1>
            <div className="relative">
                <button className="bg-gray-700 p-2 rounded">Show</button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg">
                    <button onClick={() => setFilter('all')} className="block px-4 py-2 w-full text-left">Show All</button>
                    <button onClick={() => setFilter('unwatched')} className="block px-4 py-2 w-full text-left">Show Unwatched</button>
                    <button onClick={() => setFilter('watched')} className="block px-4 py-2 w-full text-left">Show Watched</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
