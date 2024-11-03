import React from 'react';
import './App.scss';
import { createApiClient, Ticket } from './api';
import { PinFilled } from '@wix/wix-ui-icons-common';

export type AppState = {
	tickets?: Ticket[],
	search: string;
}
// 
const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: ''
	}

	searchDebounce: any = null;

	async componentDidMount() {
		const tickets = await api.getTickets()
		this.setState({
			tickets: tickets.map(ticket => ({ ...ticket, isPinned: false })) // Ensure isPinned is initialized
		});
	}

	renderTickets = (tickets: Ticket[]) => {

		const filteredTickets = tickets
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));


		const pinnedTickets = filteredTickets.filter(ticket => ticket.isPinned);
		const otherTickets = filteredTickets.filter(ticket => !ticket.isPinned);

		return (
			<ul className='tickets'>
				{/* Render pinned tickets first */}
				{pinnedTickets.map((ticket) => this.renderTicket(ticket))}
				{/* Render other tickets */}
				{otherTickets.map((ticket) => this.renderTicket(ticket))}
			</ul>
		)
	}

	renderTicket = (ticket: Ticket) => (
		<li key={ticket.id} className='ticket'>
			<div className='ticketHeader'> <h5 className='title'>{ticket.title}</h5>
				<PinFilled onClick={() => this.togglePin(ticket.id)}>
					{ticket.isPinned ? 'Unpin' : 'Pin'}
				</PinFilled>
			</div>
			<h4 className='content'>{ticket.content}</h4>
			{ticket.labels && ticket.labels.length > 0 && (
				<div className='labels'>
					{ticket.labels.map(label => (
						<span key={label} className='label'>{label}</span>
					))}
				</div>
			)}
			<footer>
				<div className='meta-data'>By {ticket.userEmail} | {new Date(ticket.creationTime).toLocaleString()}</div>
			</footer>
			{/* Render labels */}

		</li>
	)


	togglePin = (id: string) => {
		// this.setState((prevState) => ({
		// 	tickets: prevState.tickets?.map(ticket =>
		// 		ticket.id === id ? { ...ticket, isPinned: !ticket.isPinned } : ticket)
		// }));
		console.log(':)))))')

	};

	onSearch = async (val: string, newPage?: number) => {

		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}

	render() {
		const { tickets } = this.state;

		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)} />
			</header>
			{tickets ? <div className='results'>Showing {tickets.length} results</div> : null}
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;