import Friends from "../pages/Friends";
import {getAllByText, render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Router} from "react-router-dom";
import axios from 'axios';
import userEvent from "@testing-library/user-event";
import {createMemoryHistory} from "history";

jest.mock("axios");
describe(Friends, () => {
    let token;
    let setToken;

    // this will run before each of the tests
    beforeEach(() => {
        // mock this axios
        axios.get = jest.fn().mockResolvedValue(
            { data: {
                    current_friends: [[2, "friend 2"], [45, "friend 45"]],
                    incoming_friends: [[56, "friend 56"]],
                    outgoing_friends: [[1, "friend 1"]],
                }});
        axios.post = jest.fn().mockResolvedValue({data: {}});

        // this tracks any alerts that take place
        window.alert = jest.fn();

        // tokens to be passed as props if they are needed in the specific test
        token = "test_token";
        setToken = jest.fn((newTokenValue) => {token = newTokenValue});
    });

    // check that the basic page functions correctly, if this fails other tests may fail even if they work
    it("All key components render", async () => {
        render(<MemoryRouter><Friends token={token} setToken={setToken}/></MemoryRouter>);

        // check all of the headings have been rendered properly
        const currentFriends = screen.getByText("Current Friends");
        const addFriends = screen.getByText("Add Friend");
        const incomingFriends = screen.getByText("My Recieved Requests");
        expect(currentFriends).toBeInTheDocument();
        expect(addFriends).toBeInTheDocument();
        expect(incomingFriends).toBeInTheDocument();

        // before get request has been received and page updated it simulates having no friends,
        // check that the correct no friend message shows
        const noFriendsMessage = screen.getByText("No friends yet");
        const noReceivedRequest = screen.getByText("No received friend requests");
        expect(noFriendsMessage).toBeInTheDocument();
        expect(noReceivedRequest).toBeInTheDocument();

        await waitFor(() => {
            // check the fields for sending friend request render
            const usernameField = screen.getByLabelText("Username:");
            const sendRequestButton = screen.getByText("Send Friend Request");
            expect(usernameField).toBeInTheDocument();
            expect(sendRequestButton).toBeInTheDocument();
        });

        // wait for the page to update with all the posted friends information
        await waitFor(() => {
            // check all of the data on current friends renders correctly
            const currentFriend1 = screen.getByText("friend 2");
            const currentFriend2 = screen.getByText("friend 45");
            const noOfRemoveButtons = screen.getAllByText("Remove").length;
            expect(currentFriend1).toBeInTheDocument();
            expect(currentFriend2).toBeInTheDocument();
            expect(noOfRemoveButtons).toBe(2);

            // check outgoing requests render correctly
            const sentRequest = screen.getByText("friend 56");
            const cancelRequest = screen.getByText("Cancel");
            expect(sentRequest).toBeInTheDocument();
            expect(cancelRequest).toBeInTheDocument();

            // check received requests render correctly
            const receivedRequest = screen.getByText("friend 1");
            const acceptRequest = screen.getByText("Accept");
            const rejectRequest = screen.getByText("Reject");
            expect(receivedRequest).toBeInTheDocument();
            expect(acceptRequest).toBeInTheDocument();
            expect(rejectRequest).toBeInTheDocument();
        });
    });


    // check removing a friend sends the intended request and renders the new information on the page
    it("Remove friend button", async () => {
        // the return message when a friend is successfully removed
        axios.post = jest.fn().mockResolvedValue({data: {message: "Friend removed successfully"}});

        render(<MemoryRouter><Friends token={token} setToken={setToken}/></MemoryRouter>);

        let removeFriend1Button;

        await waitFor(async () => {
            // check that friend 2 is on the page before removing them
            const currentFriend1 = screen.getByText("friend 2");
            expect(currentFriend1).toBeInTheDocument();

            removeFriend1Button = screen.getAllByText("Remove")[0];
        });

        // update the jest mock so that when friend 2 is removed it sends back the correct data
        axios.get = jest.fn().mockResolvedValue(
            { data: {
                    current_friends: [[45, "friend 45"]],
                    incoming_friends: [[56, "friend 56"]],
                    outgoing_friends: [[1, "friend 1"]],
                }});

        // remove "friend 2"
        await userEvent.click(removeFriend1Button);

        // check that the request to remove friend 2 has been sent to the backend
        await expect(axios.post).toHaveBeenCalledWith("/remove_friend", {"friend_id": 2}, {"headers": {"Authorization": "Bearer test_token"}});

        await waitFor(() => {
            // check that after this friend 2 has been removed but friend 45 is still on the page
            const currentFriend1 = screen.queryByText("friend 2");
            const currentFriend2 = screen.getByText("friend 45");
            expect(currentFriend1).toBeNull();
            expect(currentFriend2).toBeInTheDocument();
        });
    });


    // check that sending a friend request sends the correct axios request
    it("Send friend request form", async () => {
        // the return message when a friend is successfully requested
        axios.post = jest.fn().mockResolvedValue({data: {message: "Friend request sent"}});

        render(<MemoryRouter><Friends token={token} setToken={setToken}/></MemoryRouter>);

        // get the two inputs for sending a friend request
        const usernameField = screen.getByRole('textbox', { name: /username/i });
        const sendRequestButton = screen.getByText("Send Friend Request");

        await waitFor(async () => {
            // check that there is only 1 outgoing friend request
            const outgoing_friends = screen.getAllByText("Cancel");
            expect(outgoing_friends.length).toBe(1);
        });

        // simulate the backend return after friend 37 has been returned
        axios.get = jest.fn().mockResolvedValue(
            { data: {
                    current_friends: [[45, "friend 45"]],
                    incoming_friends: [[56, "friend 56"]],
                    outgoing_friends: [[1, "friend 1"], [37, "friend 37"]],
                }});

        // fill in the username field and then send the request
        await userEvent.type(usernameField, "friend 37");
        await userEvent.click(sendRequestButton);

        // make sure a post request has been made with the correct information
        expect(axios.post).toHaveBeenCalledWith("/request_friend", {"username": "friend 37"}, {"headers": {"Authorization": "Bearer test_token"}});

        // check that "friend 37 has been rendered correctly on the page
        await waitFor(() => {
            // check that there are now w outgoing friend requests
            const outgoing_friends = screen.getAllByText("Cancel");
            expect(outgoing_friends.length).toBe(2);

            // check friend 37 appears on the screen
            const outgoingFriend = screen.getByText("friend 37");
            expect(outgoingFriend).toBeInTheDocument();
        });
    });


    // check cancelling outgoing request sends the required axios request
    it("Cancel outgoing friend request", async () => {
        // the return message when an outgoing friend request is successfully cancelled
        axios.post = jest.fn().mockResolvedValue({data: {message: "Friend request cancelled"}});

        render(<MemoryRouter><Friends token={token} setToken={setToken}/></MemoryRouter>);

        let cancelRequest;

        await waitFor(() => {
            cancelRequest = screen.getAllByText("Cancel");
            expect(cancelRequest.length).toBe(1);
        });

        // simulate the backend return after friend 1 request has been cancelled
        axios.get = jest.fn().mockResolvedValue(
            { data: {
                    current_friends: [[45, "friend 45"]],
                    incoming_friends: [[56, "friend 56"]],
                    outgoing_friends: [],
                }});

        await userEvent.click(cancelRequest[0]);

        // check that the request to remove the request has been sent
        expect(axios.post).toHaveBeenCalledWith("/cancel_request", {"friend_id": 1}, {"headers": {"Authorization": "Bearer test_token"}});

        await waitFor(() => {
            // check that there are no instances of cancel and friend 1 is not displayed
            const outgoingRequest = screen.queryByText("friend 1");
            cancelRequest = screen.queryAllByText("Cancel");
            expect(cancelRequest.length).toBe(0);
            expect(outgoingRequest).toBeNull();
        });
    });

    // check accepting incoming friend request sends the required axios request and updates the page
    it("Accept incoming friend request", async () => {
        // the return message when a friend request is accepted
        axios.post = jest.fn().mockResolvedValue({data: {message: "Friend request accepted"}});

        render(<MemoryRouter><Friends token={token} setToken={setToken}/></MemoryRouter>);

        let acceptButton;

        await waitFor(() => {
            // check that there is only 1 accept button
            acceptButton = screen.getAllByText("Accept");
            expect(acceptButton.length).toBe(1);
        });

        // simulate the backend return after friend 56 request has been acceted
        axios.get = jest.fn().mockResolvedValue(
            { data: {
                    current_friends: [[2, "friend 2"], [45, "friend 45"], [56, "friend 56"]],
                    incoming_friends: [],
                    outgoing_friends: [[1, "friend 1"]],
                }});

        await userEvent.click(acceptButton[0]);

        // check that the post request to accept a friend has been called correctly
        expect(axios.post).toHaveBeenCalledWith("/accept_friend", {"friend_id": 56}, {"headers": {"Authorization": "Bearer test_token"}});

        // wait for the page to be updated
        await waitFor(() => {
            // check there are no longer any incoming requests
            acceptButton = screen.queryAllByText("Accept");
            expect(acceptButton.length).toBe(0);

            // check that friend 56 is still on the page but is now on the accepted side
            const newFriend = screen.getByText("friend 56");
            const totalFriends = screen.getAllByText("Remove");
            expect(newFriend).toBeInTheDocument();
            expect(totalFriends.length).toBe(3);
        });
    });

    // check reject incoming friend request sends the required axios request and updates the page
    it("Reject incoming friend request", async () => {
        // the return message when a friend request is rejected
        axios.post = jest.fn().mockResolvedValue({data: {message: "Friend request rejected"}});

        render(<MemoryRouter><Friends token={token} setToken={setToken}/></MemoryRouter>);

        let rejectButton;

        await waitFor(() => {
            // check that there is only 1 reject button
            rejectButton = screen.getAllByText("Reject");
            expect(rejectButton.length).toBe(1);
        });

        // simulate the backend return after friend 56 request has been rejected
        axios.get = jest.fn().mockResolvedValue(
            { data: {
                    current_friends: [[2, "friend 2"], [45, "friend 45"]],
                    incoming_friends: [],
                    outgoing_friends: [[1, "friend 1"]],
                }});

        await userEvent.click(rejectButton[0]);

        // check that the post request to reject a friend has been called correctly
        expect(axios.post).toHaveBeenCalledWith("/reject_friend", {"friend_id": 56}, {"headers": {"Authorization": "Bearer test_token"}});

        // wait for the page to be updated
        await waitFor(() => {
            // check there are no longer any incoming requests and friend 56 is not on the page
            rejectButton = screen.queryAllByText("Reject");
            expect(rejectButton.length).toBe(0);
            const rejectedFriend = screen.queryByText("friend 56");
            expect(rejectedFriend).toBeNull();
        });
    });
});