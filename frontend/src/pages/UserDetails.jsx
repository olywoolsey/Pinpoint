import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserDetails(props) {
    const [users, setUsers] = useState([]);
    const [searchBar, setSearch] = useState("");
    const [selectedColumn, setSelectedColumn] = useState("username");
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('');
    const [isUsernameSort, setIsUsernameSort] = useState(false);
    const [isEmailSort, setIsEmailSort] = useState(false); 
    const [selectSubscriptionFilter, setSelectSubscriptionFilter] = useState("");

    useEffect(() => {
        axios({
            method: "GET",
            url: "/users_data",
            headers: {
                Authorization: 'Bearer ' + props.token
            }
        })
        .then(response => {
            setUsers(response.data);
        })
        .catch(error => {
            console.error("There was an error fetching user data:", error);
        });
    }, [props.token]);

    // updates the fileds for order and sorting
    const handleSortChange = (field, order) => {
        setIsUsernameSort(false);
        setIsEmailSort(false); 
        setSortField(field);
        setSortOrder(order);
    };

     // sorts for email collum in the displayed database
    const EmailSort = () => {
        const shouldSortAlphabetically = !isEmailSort;
        setIsEmailSort(shouldSortAlphabetically);
        setIsUsernameSort(false); 
        if (shouldSortAlphabetically) {
            setSortField("email");
            setSortOrder("asc");
        } else {
            setSortField(null);
            setSortOrder('');
        }
    };
    // sorts the username collum in the displayed database
    const UsernameSort = () => {
        const shouldSortAlphabetically = !isUsernameSort;
        setIsUsernameSort(shouldSortAlphabetically);
        if (shouldSortAlphabetically) {
            setSortField("username");
            setSortOrder("asc");
        } else {
            setSortField(null);
            setSortOrder('');
        }
    };

    // sorts by Date in the displayed database
    const sortByDate = (users) => {
        if (!sortField) return users; 
        return [...users].sort((a, b) => {
            // Converts  string values to integers and sorts them numerically.
            if (sortField === 'user_id') {
                const A = parseInt(a[sortField], 10);
                const B = parseInt(b[sortField], 10);
                return sortOrder === 'asc' ? A - B : B - A;

            //Dates are converted into JavaScript Date objects.
            } else if (sortField === 'account_creation_date' || sortField === 'next_payment_date') {
                const dateA = a[sortField] === "Not subscribed" ? new Date(8640000000000000) : new Date(a[sortField]);
                const dateB = b[sortField] === "Not subscribed" ? new Date(8640000000000000) : new Date(b[sortField]);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;

            //Converts values to lowercase strings for case-insensitive comparison using localeCompare.
            } else {
                const valueA = a[sortField]?.toString().toLowerCase() ?? '';
                const valueB = b[sortField]?.toString().toLowerCase() ?? '';
                return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
        });
    }
    // filters the database, only displaying records that fits the user conditions
    const filteredAndSortedUsers = sortByDate(users.filter(user => 
        user[selectedColumn]?.toString().toLowerCase().includes(searchBar.toLowerCase()) &&
        (selectSubscriptionFilter ? user.plan_type === selectSubscriptionFilter : true) 
    ));

    return (
        <div className="h-screen bg-blue-100 shadow rounded-lg p-6">
            <h1 className="py-2 text-2xl font-semibold">User Details</h1>
            <div className="flex justify-center space-x-4 mb-4">
                <label htmlFor="selectDetail" className='mt-2'>Select a column to search:</label>
                <select
                    id= "selectDetail"
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/6 p-2.5"
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                >
                    <option value="user_id">User ID</option>
                    <option value="username">Username</option>
                    <option value="email">Email</option>
                    <option value="account_creation_date">Account Creation Date</option>
                    <option value="next_payment_date">Next Payment Date</option>
                    <option value="plan_type">Subscription Type</option>
                </select>  
                <label htmlFor="search" className='mt-2'>Search User table:</label>              
                <input
                    id= "search"
                    type="text"
                    placeholder="Search..."
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/6 p-2.5"
                    value={searchBar}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-center text-black bg-custom-teal">
                        <thead className="text-sm text-white uppercase bg-blue-800">
                            <tr>
                                <th scope="col" className="py-3 px-6 w-1/6">
                                    <label htmlFor='userID'>User ID</label>
                                    <select
                                        id='userID'
                                        className="ml-2 text-gray-900 text-xs"
                                        onChange={(e) => handleSortChange("user_id", e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="asc">ASC</option>
                                        <option value="desc">DESC</option>
                                    </select>
                                </th>
                                <th scope="col" className="py-3 px-6 w-1/6">
                                    <label htmlFor='username'>Username</label>
                                    <input
                                        id="username"
                                        type="checkbox"
                                        checked={isUsernameSort}
                                        onChange={UsernameSort}
                                        className="ml-2"
                                    />
                                </th>
                                <th scope="col" className="py-3 px-6 w-1/6">
                                    <label htmlFor='email'>Email</label>
                                    <input
                                        id='email'
                                        type="checkbox"
                                        checked={isEmailSort}
                                        onChange={EmailSort}
                                        className="ml-2"
                                    />
                                </th>
                                <th scope="col" className="py-3 px-6 w-1/6">
                                    <label htmlFor='accountCreation'>Account Creation Date</label>
                                    <select
                                        id='accountCreation'
                                        className="ml-2 text-gray-900 text-xs"
                                        onChange={(e) => handleSortChange("account_creation_date", e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="asc">ASC</option>
                                        <option value="desc">DESC</option>
                                    </select>
                                </th>
                                <th scope="col" className="py-3 px-6 w-1/6">
                                    <label htmlFor='nextPayment'>Next Payment Date</label>
                                    <select
                                        id='nextPayment'
                                        className="ml-2 text-gray-900 text-xs"
                                        onChange={(e) => handleSortChange("next_payment_date", e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="asc">ASC</option>
                                        <option value="desc">DESC</option>
                                    </select>
                                </th>
                                <th scope="col" className="py-3 px-6 w-1/6">
                                    <label htmlFor='subType'>Subscription Type</label>
                                    <select
                                        id='subType'
                                        className="ml-2 text-gray-900 text-xs"
                                        value={selectSubscriptionFilter}
                                        onChange={(e) => setSelectSubscriptionFilter(e.target.value)}
                                    >
                                        <option value="">All Subscriptions</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="annually">Annually</option>
                                        <option value="not subscribed">Not Subscribed</option>
                                    </select>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedUsers.map((user, index) => (
                                <tr key={user.user_id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                                    <td className="py-4 px-6 w-1/6">{user.user_id}</td>
                                    <td className="py-4 px-6 w-1/6">{user.username}</td>
                                    <td className="py-4 px-6 w-1/6">{user.email}</td>
                                    <td className="py-4 px-6 w-1/6">{user.account_creation_date}</td>
                                    <td className="py-4 px-6 w-1/6">{user.next_payment_date !== "Not subscribed" ? user.next_payment_date : "-"}</td>
                                    <td className="py-4 px-6 w-1/6">{user.plan_type.charAt(0).toUpperCase() + user.plan_type.slice(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
    );

}

export default UserDetails;
