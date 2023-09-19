//ProjectState: 프로젝트 상태를 관리하는 싱글톤 클래스
type Listener = (items: Project[]) => void;
class ProjectState {
	private static instance: ProjectState;
	private projects: Project[] = [];
	private listeners: any[] = [];

	private constructor() {}

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
	addListener(listenerFn: Listener) {
		this.listeners.push(listenerFn);
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

//ProjectInput: 사용자의 입력을 받아 개별 프로젝트 신규 등록을 처리하는 클래스
class ProjectInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		this.templateElement = <HTMLTemplateElement>(
			document.querySelector("#project-input")!
		);
		this.hostElement = <HTMLDivElement>document.querySelector("#app")!;
		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = <HTMLFormElement>importedNode.firstElementChild!;
		this.element.id = "user-input";
		this.attach();

		this.titleInputElement = <HTMLInputElement>document.querySelector("#title");
		this.descriptionInputElement = <HTMLInputElement>(
			document.querySelector("#description")
		);
		this.peopleInputElement = <HTMLInputElement>(
			document.querySelector("#people")
		);
		this.configure();
	}
	private attach() {
		this.hostElement.insertAdjacentElement("afterbegin", this.element);
	}
	private configure() {
		this.element.addEventListener("submit", this.submitHandler);
	}
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
class ProjectList {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;
	assignedProjects: Project[];

	constructor(private type: "active" | "finished") {
		this.templateElement = <HTMLTemplateElement>(
			document.querySelector("#project-list")!
		);
		this.hostElement = <HTMLDivElement>document.querySelector("#app")!;
		this.assignedProjects = [];
		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = <HTMLElement>importedNode.firstElementChild!;
		this.element.id = `${this.type}-projects`;
		projectState.addListener((projects: Project[]) => {
			this.assignedProjects = projects; //전체 상태에서 프로젝트 목록 전체를 받아옴
			this.renderProjects(); //프로젝트 목록 내의 개별 프로젝트들을 렌더링해주는 함수
		});
		this.attach();
		this.renderContent();
	}

	attach() {
		this.hostElement.insertAdjacentElement("beforeend", this.element);
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
