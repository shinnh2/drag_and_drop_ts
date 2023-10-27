//State: 프로젝트 상태를 나타내는 기본 상태 클래스
type Listener<T> = (items: T[]) => void;
class State<T> {
	protected listeners: Listener<T>[] = [];
	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}
}
//ProjectState: 프로젝트 상태를 관리하는 싱글톤 클래스
class ProjectState extends State<Project> {
	private projects: Project[] = [];
	private static instance: ProjectState;

	private constructor() {
		super();
	}

	static getInstance() {
		if (this.instance) return this.instance;
		this.instance = new ProjectState();
		return this.instance;
	}

	addProject(title: string, description: string, numOfPeople: number) {
		const newProject = new Project(
			Math.random().toString(),
			title,
			description,
			numOfPeople,
			ProjectStatus.Active
		);
		this.projects.push(newProject);
		for (let listenerFn of this.listeners) {
			listenerFn(this.projects.slice());
		}
	}
}
//ProjectState 클래스 인스턴스 생성
const projectState = ProjectState.getInstance();

//Project: 개별 프로젝트를 나타내는 클래스
enum ProjectStatus {
	Active,
	Finished,
}
class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus
	) {}
}

//autobind 데코레이터 : 이벤트 핸들러의 this 바인딩을 자동으로 처리
function autobind(
	_target: any,
	_methodName: string,
	descriptor: PropertyDescriptor
) {
	const originalMethod = descriptor.value;
	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		get() {
			return originalMethod.bind(this);
		},
	};
	return adjDescriptor;
}

//validater: 유효성 검사 함수
interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}
function validater(validatableInput: Validatable): boolean {
	let isValid = true;
	if (validatableInput.required) {
		isValid = isValid && validatableInput.value.toString().trim().length !== 0;
	}
	if (
		typeof validatableInput.value === "string" &&
		validatableInput.minLength
	) {
		isValid =
			isValid && validatableInput.value.length >= validatableInput.minLength;
	}
	if (
		typeof validatableInput.value === "string" &&
		validatableInput.maxLength
	) {
		isValid =
			isValid && validatableInput.value.length <= validatableInput.maxLength;
	}
	if (typeof validatableInput.value === "number" && validatableInput.min) {
		isValid = isValid && validatableInput.value >= validatableInput.min;
	}
	if (typeof validatableInput.value === "number" && validatableInput.max) {
		isValid = isValid && validatableInput.value <= validatableInput.max;
	}
	return isValid;
}

//Component: 다른 클래스들의 기본이 되는 base 컴포넌트 클래스
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		newElementId?: string
	) {
		this.templateElement = <HTMLTemplateElement>(
			document.querySelector(templateId)!
		);
		this.hostElement = <T>document.querySelector(hostElementId)!;
		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = <U>importedNode.firstElementChild!;
		if (newElementId) this.element.id = newElementId;

		this.attach(insertAtStart);
	}

	attach(insertAtBeginning: boolean) {
		this.hostElement.insertAdjacentElement(
			insertAtBeginning ? "afterbegin" : "beforeend",
			this.element
		);
	}

	abstract configure(): void;
	abstract renderContent(): void;
}

//ProjectInput: 사용자의 입력을 받아 개별 프로젝트 신규 등록을 처리하는 클래스
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		super("#project-input", "#app", true, "user-input");

		this.titleInputElement = <HTMLInputElement>document.querySelector("#title");
		this.descriptionInputElement = <HTMLInputElement>(
			document.querySelector("#description")
		);
		this.peopleInputElement = <HTMLInputElement>(
			document.querySelector("#people")
		);

		this.configure();
		this.renderContent();
	}
	configure() {
		this.element.addEventListener("submit", this.submitHandler);
	}
	renderContent() {}
	@autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		if (Array.isArray(userInput)) {
			const [title, desc, people] = userInput;
			projectState.addProject(title, desc, people);
			this.clearInputs();
		}
	}
	private gatherUserInput(): [string, string, number] | void {
		const enteredTitle = this.titleInputElement.value;
		const enteredDescription = this.descriptionInputElement.value;
		const enteredPeople = this.peopleInputElement.value;

		const titleVlidatable: Validatable = {
			value: enteredTitle,
			required: true,
			minLength: 1,
		};
		const descVlidatable: Validatable = {
			value: enteredDescription,
			required: true,
			minLength: 5,
		};
		const peopleVlidatable: Validatable = {
			value: +enteredPeople,
			required: true,
			min: 1,
			max: 5,
		};

		if (!validater(titleVlidatable)) {
			alert("제목은 1자 이상 입력해야 합니다.");
			return;
		}
		if (!validater(descVlidatable)) {
			alert("설명은 5자 이상 입력해야 합니다.");
			return;
		}
		if (!validater(peopleVlidatable)) {
			alert("인원수는 1~5로 입력해야 합니다.");
			return;
		}
		return [enteredTitle, enteredDescription, +enteredPeople];
	}
	private clearInputs() {
		this.titleInputElement.value = "";
		this.descriptionInputElement.value = "";
		this.peopleInputElement.value = "";
	}
}

//ProjectList: 프로젝트 목록 렌더링
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
	assignedProjects: Project[];

	constructor(private type: "active" | "finished") {
		super("#project-list", "#app", false, `${type}-projects`);
		this.assignedProjects = [];

		this.configure();
		this.renderContent();
	}

	configure() {
		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter((project) =>
				this.type === "active"
					? project.status === ProjectStatus.Active
					: project.status === ProjectStatus.Finished
			);
			this.assignedProjects = relevantProjects;
			this.renderProjects();
		});
	}

	renderContent() {
		const listId = `${this.type}-projects-list`;
		const listTitle = `${this.type.toUpperCase()} PROJECT`;
		this.element.querySelector("ul")!.id = listId;
		this.element.querySelector("h2")!.textContent = listTitle;
	}
	renderProjects() {
		const listEl = <HTMLUListElement>(
			this.element.querySelector(`#${this.type}-projects-list`)!
		);
		listEl.innerHTML = "";
		for (let prjItem of this.assignedProjects) {
			const listItem = document.createElement("li");
			listItem.textContent = prjItem.title;
			listEl.appendChild(listItem);
		}
	}
}

//인스턴스 실행
const prjInput = new ProjectInput();
const prjListActive = new ProjectList("active");
const prjListFinished = new ProjectList("finished");
