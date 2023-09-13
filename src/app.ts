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
			const [title, desc, people] = userInput;
		}
		this.clearInputs();
	}
	private gatherUserInput(): [string, string, number] | void {
		const enteredTitle = this.titleInputElement.value;
		const enteredDescription = this.descriptionInputElement.value;
		const enteredPeople = this.peopleInputElement.value;
		if (enteredTitle.trim().length === 0) {
			alert("제목을 입력해주세요");
			return;
		}
		if (enteredDescription.trim().length === 0) {
			alert("설명을 입력해주세요");
			return;
		}
		if (enteredPeople.trim().length === 0) {
			alert("인원수를 입력해주세요");
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

//인스턴스 실행
const prjInput = new ProjectInput();
