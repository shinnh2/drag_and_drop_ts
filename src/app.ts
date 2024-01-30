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
		this.updataListeners();
	}

	moveProject(projectId: string, newStatus: ProjectStatus) {
		const project = this.projects.find((el) => el.id === projectId);
		if (project && project.status !== newStatus) {
			project.status = newStatus;
			this.updataListeners();
		}
	}

	private updataListeners() {
		for (let listenerFn of this.listeners) {
			listenerFn(this.projects.slice());
		}
	}
}
//ProjectState 클래스 인스턴스 생성
const projectState = ProjectState.getInstance();

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

//drag & drop 인터페이스
interface Draggable {
	dragStartHandler(event: DragEvent): void;
	dragEndHandler(event: DragEvent): void;
}
interface DragTarget {
	dragOverHandler(event: DragEvent): void;
	dropHandler(event: DragEvent): void;
	dragLeaveHandler(event: DragEvent): void;
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
			document.getElementById(templateId)!
		);
		this.hostElement = <T>document.getElementById(hostElementId)!;
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
		super("project-input", "app", true, "user-input");

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

//ProjectItem : 프로젝트 목록 개별 프로젝트 아이템 렌더링
class ProjectItem
	extends Component<HTMLUListElement, HTMLLIElement>
	implements Draggable
{
	private project: Project;

	get persons() {
		return this.project.people > 1
			? `${this.project.people} persons`
			: "1 person";
	}

	constructor(hostElementId: string, project: Project) {
		super("single-project", hostElementId, false, project.id);
		this.project = project;

		this.configure();
		this.renderContent();
	}

	configure() {
		this.element.addEventListener("dragstart", this.dragStartHandler);
		this.element.addEventListener("dragend", this.dragEndHandler);
	}
	renderContent() {
		this.element.querySelector("h2")!.textContent = this.project.title;
		this.element.querySelector("h3")!.textContent = `${this.persons} assigned`;
		this.element.querySelector("p")!.textContent = this.project.description;
	}
	@autobind
	dragStartHandler(event: DragEvent): void {
		//드래그 이벤트가 시작될 때 발생하는 메서드
		//위 dataTransfer 객체는 드래그 앤 드롭 작업 중에 드래그되고 있는 데이터를 보관하기 위해 사용된다.
		event.dataTransfer!.setData("text/plain", this.project.id);
		//지정된 타입의 데이터를 설정한다. 첫번째 인자 데이터 형식, 두번째는 데이터
		event.dataTransfer!.effectAllowed = "move";
		//드래그시 허용되는 효과를 지정한다. 데이터가 현재 위치에서 드롭위치로 복사되는지, 이동되는지 등을 나타낸다.
		//여기서는 이동이 목적이므로 =’move’ 를 덧붙여 주어 드래그의 의도를 나타내준다.
	}
	@autobind
	dragEndHandler(_: DragEvent): void {
		//드래그 이벤트가 끝날 때 발생하는 메서드
		//사용하지 않는 매개변수는 '_'로 처리해야 에러없이 컴파일된다.
	}
}

//ProjectList: 프로젝트 목록 렌더링
class ProjectList
	extends Component<HTMLDivElement, HTMLElement>
	implements DragTarget
{
	assignedProjects: Project[];

	constructor(private type: "active" | "finished") {
		super("project-list", "app", false, `${type}-projects`);
		this.assignedProjects = [];

		this.configure();
		this.renderContent();
	}

	@autobind
	dragOverHandler(event: DragEvent): void {
		//해당 메서드는 개별 프로젝트를 드래그하고 있는 상태에서 드롭가능한 곳에 도달했을 때 표시해주는 작업을 처리해줄 수 있다.
		if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
			event.preventDefault();
			//위 문구를 작성하지 않으면 사용자가 드래그 후 드롭했을 때 드롭 이벤트가 실행되지 않는다.
		}

		const listEl = this.element.querySelector("ul")!;
		listEl.classList.add("droppable");
	}
	@autobind
	dragLeaveHandler(_: DragEvent): void {
		//해당 메서드는 개별 프로젝트를 드래그하고 있는 상태에서 드롭가능한 곳을 떠났을 때 드롭가능한 곳의 모습이 변경되었을 경우 다시 원상복구 하는 등의 처리를 해준다.
		const listEl = this.element.querySelector("ul")!;
		listEl.classList.remove("droppable");
	}
	@autobind
	dropHandler(event: DragEvent): void {
		const prjId = event.dataTransfer!.getData("text/plain");
		projectState.moveProject(
			prjId,
			this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
		);
	}

	configure() {
		this.element.addEventListener("dragover", this.dragOverHandler);
		this.element.addEventListener("dragleave", this.dragLeaveHandler);
		this.element.addEventListener("drop", this.dropHandler);
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
			new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
		}
	}
}

//인스턴스 실행
const prjInput = new ProjectInput();
const prjListActive = new ProjectList("active");
const prjListFinished = new ProjectList("finished");
