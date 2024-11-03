import React from 'react';
import './App.scss';
import { createApiClient, Ticket } from './api';
import { PinFilled, UndoFilled } from '@wix/wix-ui-icons-common';

type SearchParams = {
	query: string;
	after?: string;
	before?: string;
	from?: string;
};

export type AppState = {
	tickets?: Ticket[],
	search: string;
	page: number;
	searchParams?: SearchParams;
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		tickets: [],
		search: '',
		page: 1,
		searchParams: { query: '' }
	}

	searchDebounce: any = null;
	loadMoreRef: React.RefObject<HTMLDivElement> = React.createRef(); // Reference for the Load More trigger
	observer: IntersectionObserver | null = null; // IntersectionObserver instance

	async componentDidMount() {
		await this.loadTickets();
		this.setupObserver(); // Setup the observer
	}

	componentWillUnmount() {
		this.observer?.disconnect(); // Clean up the observer
	}

	setupObserver = () => {
		this.observer = new IntersectionObserver((entries) => {
			const entry = entries[0];
			if (entry.isIntersecting) {
				this.loadMoreTickets(); // Load more tickets when intersecting
			}
		});

		if (this.loadMoreRef.current) {
			this.observer.observe(this.loadMoreRef.current); // Start observing the Load More trigger
		}
	}

	async loadTickets() {
		const tickets = await api.getTickets(this.state.searchParams);
		this.setState(prevState => ({
			tickets: [...prevState.tickets, ...(Array.isArray(tickets) ? tickets : [])],
		}));
	}

	loadMoreTickets = async () => {
		this.setState(prevState => ({
			page: prevState.page + 1 // Increment the page number
		}), this.loadTickets); // Call loadTickets after updating the page state
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
				<div ref={this.loadMoreRef} className='load-more-trigger'></div>
			</ul>
		)
	}

	renderTicket = (ticket: Ticket) => {
		const IconComponent = ticket.isPinned ? UndoFilled : PinFilled;
		return (
			<li key={ticket.id} className='ticket'>
				<div className='ticketHeader'> <h5 className='title'>{ticket.title}</h5>
					<IconComponent className='pinIcon' onClick={() => this.togglePin(ticket.id)}>
						{ticket.isPinned ? 'Unpin' : 'Pin'}
					</IconComponent>
				</div>
				{/* Content section with show more/less */}
				<h4 className={`content ${ticket.isExpanded ? 'expanded' : ''}`}>
					{ticket.content}
				</h4>
				{ticket.content.length > 450 && ( // Only show toggle if content is lengthy
					<span className='toggleButton' onClick={() => this.toggleExpand(ticket.id)}>
						{ticket.isExpanded ? 'See Less' : 'See More'}
					</span>
				)}
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
			</li>
		)
	}


	togglePin = (id: string) => {
		this.setState((prevState) => ({
			tickets: prevState.tickets?.map(ticket =>
				ticket.id === id ? { ...ticket, isPinned: !ticket.isPinned } : ticket)
		}));

	};

	toggleExpand = (id: string) => {
		this.setState((prevState) => ({
			tickets: prevState.tickets?.map(ticket =>
				ticket.id === id ? { ...ticket, isExpanded: !ticket.isExpanded } : ticket)
		}));
	}

	parseSearch = (val: string) => {
		const searchParams: SearchParams = { query: val };

		const afterMatch = val.match(/after:(\d{2}\/\d{2}\/\d{4})/);
		const beforeMatch = val.match(/before:(\d{2}\/\d{2}\/\d{4})/);
		const fromMatch = val.match(/from:([^\s]+)/);

		if (afterMatch) searchParams.after = afterMatch[1];
		if (beforeMatch) searchParams.before = beforeMatch[1];
		if (fromMatch) searchParams.from = fromMatch[1];

		searchParams.query = val
			.replace(/after:\d{2}\/\d{2}\/\d{4}/, '')
			.replace(/before:\d{2}\/\d{2}\/\d{4}/, '')
			.replace(/from:[^\s]+/, '')
			.trim();

		this.setState({ searchParams });
	};


	onSearch = (val: string) => {
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(() => {
			this.parseSearch(val);
			this.setState({ tickets: [], page: 1, searchParams: { query: val } }, () => {
				this.loadTickets();
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