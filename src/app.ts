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
//유효성 검사 함수 validater
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
//사용자의 입력을 받아 개별 프로젝트 신규 등록을 처리하는 클래스
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
			// const [title, desc, people] = userInput;
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

//프로젝트 목록 렌더링
class ProjectList {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;

	constructor(private type: "active" | "finished") {
		this.templateElement = <HTMLTemplateElement>(
			document.querySelector("#project-list")!
		);
		this.hostElement = <HTMLDivElement>document.querySelector("#app")!;
		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = <HTMLElement>importedNode.firstElementChild!;
		this.element.id = `${this.type}-projects`;
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
}

//인스턴스 실행
const prjInput = new ProjectInput();
const prjListActive = new ProjectList("active");
const prjListFinished = new ProjectList("finished");
